import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const db = admin.firestore();

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    res.status(500).send('Missing STRIPE_WEBHOOK_SECRET');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('Missing userId in checkout session metadata');
    return;
  }

  // Update user with Stripe customer ID
  await db.collection('users').doc(userId).update({
    stripeCustomerId: customerId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Find user by Stripe customer ID
  const usersRef = db.collection('users').where('stripeCustomerId', '==', customerId).limit(1);
  const userSnapshot = await usersRef.get();

  if (userSnapshot.empty) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  const userId = userSnapshot.docs[0].id;
  const tier = subscription.items.data[0]?.price?.metadata?.tier || 'pro';

  // Update or create subscription document
  const subscriptionsRef = db.collection('subscriptions')
    .where('userId', '==', userId)
    .where('stripeSubscriptionId', '==', subscriptionId)
    .limit(1);

  const subscriptionSnapshot = await subscriptionsRef.get();

  if (subscriptionSnapshot.empty) {
    // Create new subscription
    await db.collection('subscriptions').add({
      userId,
      tier,
      status: status === 'active' ? 'active' : status === 'past_due' ? 'past_due' : 'canceled',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    // Update existing subscription
    await subscriptionSnapshot.docs[0].ref.update({
      tier,
      status: status === 'active' ? 'active' : status === 'past_due' ? 'past_due' : 'canceled',
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(currentPeriodEnd),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Update user subscription tier
  if (status === 'active') {
    await db.collection('users').doc(userId).update({
      subscriptionTier: tier,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const usersRef = db.collection('users').where('stripeCustomerId', '==', customerId).limit(1);
  const userSnapshot = await usersRef.get();

  if (userSnapshot.empty) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  const userId = userSnapshot.docs[0].id;
  const subscriptionId = subscription.id;

  // Update subscription status
  const subscriptionsRef = db.collection('subscriptions')
    .where('userId', '==', userId)
    .where('stripeSubscriptionId', '==', subscriptionId)
    .limit(1);

  const subscriptionSnapshot = await subscriptionsRef.get();

  if (!subscriptionSnapshot.empty) {
    await subscriptionSnapshot.docs[0].ref.update({
      status: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Revert user to free tier
  await db.collection('users').doc(userId).update({
    subscriptionTier: 'free',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}


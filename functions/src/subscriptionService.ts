import * as admin from 'firebase-admin';

const db = admin.firestore();

export type SubscriptionTier = 'free' | 'pro';

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
}

export async function getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // New user - default to free tier
      await db.collection('users').doc(userId).set({
        subscriptionTier: 'free',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return 'free';
    }

    const userData = userDoc.data();
    return (userData?.subscriptionTier as SubscriptionTier) || 'free';
  } catch (error) {
    console.error('Error getting subscription tier:', error);
    return 'free'; // Default to free on error
  }
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const subscriptionsRef = db.collection('subscriptions')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1);
    
    const snapshot = await subscriptionsRef.get();
    
    if (snapshot.empty) {
      return {
        tier: 'free',
        status: 'active',
      };
    }

    const subscriptionData = snapshot.docs[0].data();
    return {
      tier: subscriptionData.tier as SubscriptionTier,
      status: subscriptionData.status as 'active' | 'canceled' | 'past_due',
      stripeCustomerId: subscriptionData.stripeCustomerId,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      currentPeriodEnd: subscriptionData.currentPeriodEnd?.toDate(),
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return {
      tier: 'free',
      status: 'active',
    };
  }
}

export async function updateSubscriptionTier(userId: string, tier: SubscriptionTier): Promise<void> {
  try {
    await db.collection('users').doc(userId).update({
      subscriptionTier: tier,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    throw error;
  }
}


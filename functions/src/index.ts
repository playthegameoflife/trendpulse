import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { fetchTrendingTopics } from './geminiService';
import { checkUsageLimit, incrementUsage, getUsageStats } from './usageService';
import { getSubscriptionTier } from './subscriptionService';
import { stripeWebhook } from './stripeWebhook';

admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Main API endpoint for fetching topics
export const getTrendingTopics = functions.https.onCall(async (data, context) => {
  // 1. Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to fetch trending topics'
    );
  }

  const userId = context.auth.uid;
  const { timeRange, searchTerm, businessContext, category } = data;

  // Validate input
  if (!timeRange || typeof timeRange !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'timeRange is required');
  }

  try {
    // 2. Get user's subscription tier
    const tier = await getSubscriptionTier(userId);

    // 3. Check usage limits (if free tier)
    if (tier === 'free') {
      const canSearch = await checkUsageLimit(userId);
      if (!canSearch) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Monthly search limit reached. Upgrade to Pro for unlimited searches.'
        );
      }
    }

    // 4. Check if business context is allowed (Pro only)
    if (businessContext && tier === 'free') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Business context personalization is available in Pro tier only. Upgrade to Pro to unlock this feature.'
      );
    }

    // 5. Fetch topics from Gemini
    const topics = await fetchTrendingTopics(
      timeRange,
      searchTerm || null,
      businessContext || null,
      category || null
    );

    // 6. Increment usage counter
    await incrementUsage(userId);

    return { topics };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error('Error in getTrendingTopics:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch trending topics. Please try again.'
    );
  }
});

// Get usage statistics
export const getUsageStatistics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;

  try {
    const stats = await getUsageStats(userId);
    return stats;
  } catch (error) {
    console.error('Error getting usage stats:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get usage statistics'
    );
  }
});

// Get subscription tier
export const getSubscriptionInfo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;

  try {
    const tier = await getSubscriptionTier(userId);
    const stats = await getUsageStats(userId);
    return { tier, usage: stats };
  } catch (error) {
    console.error('Error getting subscription info:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get subscription information'
    );
  }
});

// Create Stripe checkout session
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/subscription?success=true`,
      cancel_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/subscription?canceled=true`,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to create checkout session: ${error.message}`
    );
  }
});

// Export Stripe webhook
export { stripeWebhook };


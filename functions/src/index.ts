import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { fetchTrendingTopics } from './geminiService';
import { checkUsageLimit, incrementUsage, getUsageStats } from './usageService';
import { getSubscriptionTier } from './subscriptionService';
import { stripeWebhook } from './stripeWebhook';

admin.initializeApp();

const stripeConfig = functions.config().stripe || {};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || stripeConfig.secret_key || '', {
  apiVersion: '2023-10-16',
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

    // Log request context for debugging
    console.log('Fetching topics:', {
      userId,
      timeRange,
      category: category || 'All',
      hasSearchTerm: !!searchTerm,
      hasBusinessContext: !!businessContext
    });

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
    
    // Log detailed error information
    const errorContext = {
      userId,
      timeRange,
      category: category || 'All',
      hasSearchTerm: !!searchTerm,
      hasBusinessContext: !!businessContext,
      errorMessage: error.message,
      errorStack: error.stack
    };
    console.error('Error in getTrendingTopics:', errorContext);
    
    // Preserve original error message if available
    const errorMessage = error.message || 'Failed to fetch trending topics. Please try again.';
    
    // Add context about what failed
    let contextMessage = errorMessage;
    if (category && category !== 'All') {
      contextMessage = `${errorMessage} (Category: ${category})`;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      contextMessage
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
          price: process.env.STRIPE_PRO_PRICE_ID || stripeConfig.pro_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.WEBAPP_URL || stripeConfig.webapp?.url || 'http://localhost:3000'}?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEBAPP_URL || stripeConfig.webapp?.url || 'http://localhost:3000'}?stripe=canceled`,
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


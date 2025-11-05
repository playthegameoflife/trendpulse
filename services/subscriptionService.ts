import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

export type SubscriptionTier = 'free' | 'pro';

export interface UsageStats {
  current: number;
  limit: number;
  month: string;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  usage: UsageStats;
}

const getSubscriptionInfo = httpsCallable(functions, 'getSubscriptionInfo');
const getUsageStatistics = httpsCallable(functions, 'getUsageStatistics');
const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

export async function fetchSubscriptionInfo(): Promise<SubscriptionInfo> {
  try {
    const result = await getSubscriptionInfo();
    return result.data as SubscriptionInfo;
  } catch (error: any) {
    console.error('Error fetching subscription info:', error);
    // Default to free tier on error
    return {
      tier: 'free',
      usage: { current: 0, limit: 10, month: '' }
    };
  }
}

export async function fetchUsageStats(): Promise<UsageStats> {
  try {
    const result = await getUsageStatistics();
    return result.data as UsageStats;
  } catch (error: any) {
    console.error('Error fetching usage stats:', error);
    return { current: 0, limit: 10, month: '' };
  }
}

export async function createStripeCheckout(): Promise<{ url: string }> {
  try {
    const result = await createCheckoutSession();
    const data = result.data as { url: string };
    return data;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
}


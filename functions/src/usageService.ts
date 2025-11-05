import * as admin from 'firebase-admin';
import { getSubscriptionTier } from './subscriptionService';

const db = admin.firestore();

const FREE_TIER_LIMIT = 10; // 10 searches per month

export async function checkUsageLimit(userId: string): Promise<boolean> {
  try {
    const tier = await getSubscriptionTier(userId);
    
    // Pro tier has unlimited usage
    if (tier === 'pro') {
      return true;
    }

    // Free tier: check monthly usage
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const usageRef = db.collection('usage')
      .where('userId', '==', userId)
      .where('month', '==', currentMonth)
      .limit(1);
    
    const snapshot = await usageRef.get();
    
    if (snapshot.empty) {
      // No usage this month - create new usage document
      await db.collection('usage').add({
        userId,
        month: currentMonth,
        searchCount: 0,
        date: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    }

    const usageData = snapshot.docs[0].data();
    const searchCount = usageData.searchCount || 0;
    
    return searchCount < FREE_TIER_LIMIT;
  } catch (error) {
    console.error('Error checking usage limit:', error);
    // On error, allow the request but log it
    return true;
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  try {
    const tier = await getSubscriptionTier(userId);
    
    // Track usage for all tiers (for analytics)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const usageRef = db.collection('usage')
      .where('userId', '==', userId)
      .where('month', '==', currentMonth)
      .limit(1);
    
    const snapshot = await usageRef.get();
    
    if (snapshot.empty) {
      // Create new usage document
      await db.collection('usage').add({
        userId,
        month: currentMonth,
        searchCount: 1,
        date: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Increment existing usage
      const usageDoc = snapshot.docs[0];
      await usageDoc.ref.update({
        searchCount: admin.firestore.FieldValue.increment(1),
        lastSearchAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error incrementing usage:', error);
    // Don't throw - usage tracking failure shouldn't break the request
  }
}

export async function getUsageStats(userId: string): Promise<{ current: number; limit: number; month: string }> {
  try {
    const tier = await getSubscriptionTier(userId);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const usageRef = db.collection('usage')
      .where('userId', '==', userId)
      .where('month', '==', currentMonth)
      .limit(1);
    
    const snapshot = await usageRef.get();
    
    const current = snapshot.empty ? 0 : (snapshot.docs[0].data().searchCount || 0);
    const limit = tier === 'pro' ? Infinity : FREE_TIER_LIMIT;
    
    return { current, limit, month: currentMonth };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return { current: 0, limit: FREE_TIER_LIMIT, month: '' };
  }
}


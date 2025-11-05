import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import { Topic } from '../types';
import { cacheService } from './cacheService';

const getTrendingTopics = httpsCallable(functions, 'getTrendingTopics');

export const fetchTrendingTopics = async (
  timeRange: string,
  searchTerm?: string,
  businessContext?: string,
  category?: string
): Promise<Topic[]> => {
  // A request is cacheable only if it's generic (no search, no business context)
  const isCacheable = !searchTerm && !businessContext;
  const cacheKey = `topics-${timeRange}-${category || 'All'}`;

  if (isCacheable) {
    const cachedTopics = cacheService.get<Topic[]>(cacheKey);
    if (cachedTopics) {
      return cachedTopics;
    }
  }

  try {
    const result = await getTrendingTopics({
      timeRange,
      searchTerm: searchTerm || null,
      businessContext: businessContext || null,
      category: category || null
    });
    
    const topics = (result.data as { topics: Topic[] }).topics || [];

    // If the request was cacheable and we got results, store them.
    if (isCacheable && topics.length > 0) {
      cacheService.set(cacheKey, topics);
    }
    
    return topics;
  } catch (error: any) {
    console.error('Error fetching trending topics:', error);
    
    // Handle Firebase-specific errors
    if (error.code === 'functions/resource-exhausted') {
      throw new Error('Monthly search limit reached. Upgrade to Pro for unlimited searches.');
    }
    if (error.code === 'functions/permission-denied') {
      throw new Error('Business context personalization is available in Pro tier only. Upgrade to Pro to unlock this feature.');
    }
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Please sign in to access trending topics.');
    }
    
    throw new Error(error.message || 'Failed to fetch trending topics. Please try again.');
  }
};
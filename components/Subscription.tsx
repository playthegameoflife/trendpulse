import React, { useState, useEffect } from 'react';
import { fetchSubscriptionInfo, fetchUsageStats, createStripeCheckout, SubscriptionTier, UsageStats } from '../services/subscriptionService';
import { CreditCardIcon, SparklesIcon } from './icons';

const Subscription: React.FC = () => {
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [usage, setUsage] = useState<UsageStats>({ current: 0, limit: 10, month: '' });
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await fetchSubscriptionInfo();
      setSubscriptionTier(info.tier);
      setUsage(info.usage);
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { url } = await createStripeCheckout();
      window.location.href = url;
    } catch (error: any) {
      alert(error.message || 'Failed to start checkout. Please try again.');
      setUpgrading(false);
    }
  };

  const usagePercentage = usage.limit === Infinity ? 0 : (usage.current / usage.limit) * 100;
  const isNearLimit = usage.limit !== Infinity && usagePercentage >= 80;

  return (
    <div className="bg-white/70 p-6 rounded-xl border border-gray-200/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1d1d1f]">Subscription</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          subscriptionTier === 'pro'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {subscriptionTier === 'pro' ? 'Pro' : 'Free'}
        </span>
      </div>

      {subscriptionTier === 'free' && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Monthly Searches</span>
              <span className={`font-semibold ${isNearLimit ? 'text-red-600' : 'text-gray-900'}`}>
                {usage.current} / {usage.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isNearLimit ? 'bg-red-500' : 'bg-purple-600'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            {isNearLimit && (
              <p className="text-xs text-red-600 mt-2">
                You're running low on searches this month. Upgrade to Pro for unlimited searches.
              </p>
            )}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {upgrading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCardIcon className="w-5 h-5" />
                Upgrade to Pro
              </>
            )}
          </button>
        </>
      )}

      {subscriptionTier === 'pro' && (
        <div className="text-center py-4">
          <SparklesIcon className="w-12 h-12 text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">
            You're on the Pro plan with unlimited searches!
          </p>
        </div>
      )}
    </div>
  );
};

export default Subscription;


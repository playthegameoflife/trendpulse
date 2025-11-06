import React, { useState } from 'react';
import { createStripeCheckout, SubscriptionTier } from '../services/subscriptionService';
import { CheckIcon, SparklesIcon, XMarkIcon } from './icons';

interface PricingPageProps {
  currentTier: SubscriptionTier;
  onClose?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ currentTier, onClose }) => {
  const [upgrading, setUpgrading] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#f5f5f7] overflow-y-auto">
      {/* Hero Section */}
      <div className="text-center pt-20 pb-16 px-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#1d1d1f] mb-6">
          Unlock unlimited discovery
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          From limited to limitless. Discover what's next, without limits.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier - Elegant but Limited */}
          <div className={`bg-white rounded-2xl border-2 p-10 transition-all ${
            currentTier === 'free' ? 'border-purple-300 shadow-lg' : 'border-gray-200'
          }`}>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-[#1d1d1f] mb-3">Free</h3>
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-[#1d1d1f]">$0</span>
                <span className="text-lg text-gray-500 ml-2">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex items-start">
                <CheckIcon className="w-6 h-6 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-lg">10 discoveries per month</span>
              </div>
              <div className="flex items-start">
                <CheckIcon className="w-6 h-6 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-lg">Basic trend discovery</span>
              </div>
              <div className="flex items-start">
                <CheckIcon className="w-6 h-6 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-lg">Category filtering</span>
              </div>
            </div>

            {currentTier === 'free' ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 font-semibold py-4 px-6 rounded-xl cursor-not-allowed text-lg"
              >
                Current Plan
              </button>
            ) : (
              <div className="h-14"></div>
            )}
          </div>

          {/* Pro Tier - Hero Treatment */}
          <div className={`bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 p-10 relative transition-all transform ${
            currentTier === 'pro' ? 'border-purple-300 shadow-xl' : 'border-purple-500 shadow-2xl scale-[1.02]'
          }`}>
            {currentTier !== 'pro' && (
              <div className="absolute -top-4 right-6 bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
                Recommended
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-3xl font-bold text-[#1d1d1f]">Pro</h3>
                <SparklesIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-[#1d1d1f]">$19</span>
                <span className="text-lg text-gray-500 ml-2">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex items-start">
                <CheckIcon className="w-6 h-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-[#1d1d1f] font-semibold text-lg">Unlimited discoveries</span>
              </div>
              <div className="flex items-start">
                <CheckIcon className="w-6 h-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-[#1d1d1f] font-semibold text-lg">Personalized insights</span>
              </div>
              <div className="flex items-start">
                <CheckIcon className="w-6 h-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-[#1d1d1f] font-semibold text-lg">All advanced features</span>
              </div>
              <div className="flex items-start">
                <CheckIcon className="w-6 h-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-[#1d1d1f] font-semibold text-lg">Priority support</span>
              </div>
            </div>

            {currentTier === 'pro' ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 font-semibold py-4 px-6 rounded-xl cursor-not-allowed text-lg"
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {upgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Start discovering
                    <SparklesIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;


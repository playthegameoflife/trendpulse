import React, { useState } from 'react';
import { createStripeCheckout, SubscriptionTier } from '../services/subscriptionService';
import { CheckIcon, SparklesIcon } from './icons';

interface PricingPageProps {
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ currentTier, onUpgrade }) => {
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
    <div className="max-w-4xl mx-auto py-16 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600">Find the perfect plan for your needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Tier */}
        <div className={`bg-white rounded-xl border-2 p-8 ${
          currentTier === 'free' ? 'border-purple-500' : 'border-gray-200'
        }`}>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Free</h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#1d1d1f]">$0</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">10 searches per month</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Basic trend discovery</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Category filtering</span>
            </li>
            <li className="flex items-start">
              <XMarkIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-500 line-through">Business context personalization</span>
            </li>
          </ul>

          {currentTier === 'free' && (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
            >
              Current Plan
            </button>
          )}
        </div>

        {/* Pro Tier */}
        <div className={`bg-white rounded-xl border-2 p-8 relative ${
          currentTier === 'pro' ? 'border-purple-500' : 'border-purple-500'
        }`}>
          {currentTier !== 'pro' && (
            <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-xl text-sm font-semibold">
              Popular
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Pro</h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-[#1d1d1f]">$19</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Unlimited searches</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Business context personalization</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">All advanced features</span>
            </li>
            <li className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Priority support</span>
            </li>
          </ul>

          {currentTier === 'pro' ? (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {upgrading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Upgrade to Pro
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XMarkIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default PricingPage;


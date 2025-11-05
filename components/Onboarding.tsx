import React, { useState, useEffect } from 'react';
import { BuildingStorefrontIcon, XMarkIcon, SparklesIcon } from './icons';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: string) => void;
  subscriptionTier: 'free' | 'pro';
  currentContext?: string;
}

const Onboarding: React.FC<OnboardingProps> = ({
  isOpen,
  onClose,
  onSave,
  subscriptionTier,
  currentContext = ''
}) => {
  const [localContext, setLocalContext] = useState(currentContext);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setLocalContext(currentContext);
  }, [currentContext]);

  const handleSave = () => {
    if (subscriptionTier === 'free') {
      // Show upgrade prompt for free users
      alert('Business context personalization is available in Pro tier only. Upgrade to Pro to unlock this feature.');
      return;
    }
    onSave(localContext);
    onClose();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen || isDismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={handleDismiss}>
      <div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
            <BuildingStorefrontIcon className="w-6 h-6 text-purple-600" />
            Personalize Your Experience
          </h2>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="flex items-start gap-3 mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <SparklesIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                Make it personal
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Tell us about your business to discover relevant trends tailored just for you.
              </p>
            </div>
          </div>

          <label htmlFor="business-context" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your business
          </label>
          <textarea
            id="business-context"
            rows={8}
            className="w-full p-3 text-base text-gray-800 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500 resize-none"
            placeholder="e.g., I sell handmade leather goods on Etsy.
e.g., I run a B2B SaaS for project management.
e.g., I'm a content creator focused on AI tools."
            value={localContext}
            onChange={(e) => setLocalContext(e.target.value)}
          ></textarea>
          <p className="text-xs text-gray-500 mt-2">
            The more detail you provide, the more relevant your results will be.
          </p>

          {subscriptionTier === 'free' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Pro feature:</strong> Business context personalization requires a Pro subscription.
                <a
                  href="/subscription"
                  className="text-purple-600 hover:underline ml-1 font-semibold"
                >
                  Upgrade to Pro →
                </a>
              </p>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Not now
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 border border-purple-600 rounded-md hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;


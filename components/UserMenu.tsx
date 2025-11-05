import React, { useState, useEffect } from 'react';
import { signOut, User } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { UserIcon, ArrowRightOnRectangleIcon, CreditCardIcon } from './icons';
import { fetchSubscriptionInfo, SubscriptionTier } from '../services/subscriptionService';

interface UserMenuProps {
  user: User;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      try {
        const info = await fetchSubscriptionInfo();
        setSubscriptionTier(info.tier);
      } catch (error) {
        console.error('Error loading subscription info:', error);
      }
    };
    loadSubscriptionInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-200/60"
      >
        <UserIcon className="w-5 h-5" />
        <span className="hidden md:inline">{user.email}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          subscriptionTier === 'pro' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {subscriptionTier === 'pro' ? 'Pro' : 'Free'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;


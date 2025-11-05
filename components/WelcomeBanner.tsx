import React, { useState, useEffect } from 'react';
import { SparklesIcon, XMarkIcon } from './icons';

interface WelcomeBannerProps {
  userName?: string;
  onDismiss?: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ userName, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  return (
    <div
      className={`bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 transition-all duration-300 ${
        isAnimating ? 'opacity-0 translate-y-[-100%]' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-5 h-5 animate-pulse" />
          <div>
            <p className="font-semibold">
              Welcome to TrendPulse{userName ? `, ${userName.split(' ')[0]}` : ''}!
            </p>
            <p className="text-sm text-purple-100 mt-0.5">
              Discover trending topics powered by AI
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-purple-600/50 transition-colors"
          aria-label="Dismiss welcome message"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeBanner;


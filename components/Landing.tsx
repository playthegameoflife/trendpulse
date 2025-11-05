import React, { useState } from 'react';
import { Topic } from '../types';
import { ArrowUpIcon } from './icons';
import Auth from './Auth';

interface LandingProps {
  onSignup: () => void;
}

// Example topics for preview mode
const exampleTopics: Topic[] = [
  {
    id: '1',
    name: 'AI Agents',
    category: 'AI',
    description: 'Autonomous AI agents that can perform complex tasks and make decisions independently.',
    growth: 245
  },
  {
    id: '2',
    name: 'SaaS Boilerplates',
    category: 'SaaS',
    description: 'Pre-built starter kits for rapidly launching SaaS products with modern tech stacks.',
    growth: 189
  },
  {
    id: '3',
    name: 'No-Code Workflows',
    category: 'SaaS',
    description: 'Visual workflow builders that enable non-technical users to automate business processes.',
    growth: 167
  },
  {
    id: '4',
    name: 'AI-Powered Analytics',
    category: 'AI',
    description: 'Intelligent analytics platforms that provide actionable insights from business data.',
    growth: 156
  },
  {
    id: '5',
    name: 'Creator Economy Tools',
    category: 'Creator Economy',
    description: 'Platforms and tools that help content creators monetize and manage their audience.',
    growth: 142
  }
];

const Landing: React.FC<LandingProps> = ({ onSignup }) => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-[#f5f5f7]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">TrendPulse</h1>
          <button
            onClick={() => setShowAuth(true)}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 px-6">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#1d1d1f] mb-5">
          Find the next big thing before it takes off
        </h2>
        <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-600 mb-10">
          Discover trending topics powered by AI. See what's growing before your competitors do.
        </p>
        <button
          onClick={() => setShowAuth(true)}
          className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors text-lg shadow-lg hover:shadow-xl"
        >
          Try it free
        </button>
      </section>

      {/* Preview Topics */}
      <section className="container mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Preview</p>
          <h3 className="text-2xl font-bold text-[#1d1d1f] mt-2">See what's trending now</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {exampleTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white/70 p-6 rounded-xl border border-gray-200/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 py-1 px-2.5 rounded-full">
                  {topic.category}
                </span>
                <h3 className="text-lg font-bold text-[#1d1d1f] transition-colors mt-3">
                  {topic.name}
                </h3>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  {topic.description}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end">
                <div className="flex items-center gap-1.5 text-green-600">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{topic.growth}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button
            onClick={() => setShowAuth(true)}
            className="text-purple-600 font-semibold hover:underline"
          >
            Sign up to see more trends →
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      <Auth
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          onSignup();
        }}
      />
    </div>
  );
};

export default Landing;


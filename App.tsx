import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './services/firebaseConfig';
import { Topic } from './types';
import { fetchTrendingTopics } from './services/geminiService';
import { fetchSubscriptionInfo, SubscriptionTier } from './services/subscriptionService';
import { SearchIcon, BuildingStorefrontIcon, XMarkIcon, ArrowUpIcon, ChevronDownIcon } from './components/icons';
import AuthGuard from './components/AuthGuard';
import UserMenu from './components/UserMenu';
import Subscription from './components/Subscription';

const categories = ["All", "AI", "SaaS", "Health & Wellness", "E-commerce", "FinTech", "Gaming", "Creator Economy", "Future of Work"];
const topicsPerPage = 12;

interface HeaderProps {
    onSetBusinessClick: () => void;
    businessContextIsSet: boolean;
    user: User | null;
    subscriptionTier: SubscriptionTier;
}

const Header: React.FC<HeaderProps> = ({ onSetBusinessClick, businessContextIsSet, user, subscriptionTier }) => (
    <header className="sticky top-0 z-30 w-full bg-[#f5f5f7]/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">TrendPulse</h1>
          <nav className="flex items-center gap-4">
              {user && subscriptionTier === 'pro' && (
                  <button 
                    onClick={onSetBusinessClick}
                    className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${businessContextIsSet ? 'text-purple-600 bg-purple-100 hover:bg-purple-200/60' : 'text-gray-600 hover:bg-gray-200/60'}`}
                  >
                    <BuildingStorefrontIcon className="w-5 h-5"/>
                    My Business
                  </button>
              )}
              {user && <UserMenu user={user} />}
          </nav>
      </div>
    </header>
);

interface TopicCardProps {
    topic: Topic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => (
    <div 
        className="bg-white/70 p-6 rounded-xl border border-gray-200/80 transition-all duration-300 flex flex-col justify-between"
    >
        <div>
            <span className="text-xs font-semibold bg-gray-100 text-gray-500 py-1 px-2.5 rounded-full">{topic.category}</span>
            <h3 className="text-lg font-bold text-[#1d1d1f] transition-colors mt-3">{topic.name}</h3>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{topic.description}</p>
        </div>
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end">
            <div className="flex items-center gap-1.5 text-green-600">
                <ArrowUpIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">
                    {topic.growth}%
                </span>
            </div>
        </div>
    </div>
);

interface BusinessContextPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentContext: string;
    onSave: (newContext: string) => void;
    subscriptionTier: SubscriptionTier;
}

const BusinessContextPanel: React.FC<BusinessContextPanelProps> = ({ isOpen, onClose, currentContext, onSave, subscriptionTier }) => {
    const [localContext, setLocalContext] = useState(currentContext);

    useEffect(() => {
        setLocalContext(currentContext);
    }, [currentContext]);

    const handleSave = () => {
        if (subscriptionTier === 'free') {
            alert('Business context personalization is available in Pro tier only. Upgrade to Pro to unlock this feature.');
            return;
        }
        onSave(localContext);
        onClose();
    }

    if (!isOpen) return null;

    if (subscriptionTier === 'free') {
        return (
            <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
                <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 id="modal-title" className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                            <BuildingStorefrontIcon className="w-6 h-6 text-purple-600"/>
                            Upgrade to Pro
                        </h2>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                            <XMarkIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    <div className="p-6 flex-grow">
                        <p className="text-gray-700 mb-4">
                            Business context personalization is a Pro feature. Upgrade to Pro to unlock personalized trend discovery tailored to your business.
                        </p>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="font-semibold text-purple-900 mb-2">Pro Features:</h3>
                            <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                                <li>Unlimited searches</li>
                                <li>Business context personalization</li>
                                <li>All advanced features</li>
                                <li>Priority support</li>
                            </ul>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Close</button>
                        <button onClick={() => window.location.href = '/subscription'} className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 border border-purple-600 rounded-md hover:bg-purple-700">Upgrade to Pro</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 id="modal-title" className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                        <BuildingStorefrontIcon className="w-6 h-6 text-purple-600"/>
                        Personalize Your Experience
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-6 flex-grow">
                    <label htmlFor="business-context" className="block text-sm font-medium text-gray-700 mb-2">
                        Describe your business
                    </label>
                    <textarea
                        id="business-context"
                        rows={6}
                        className="w-full p-3 text-base text-gray-800 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., I sell handmade leather goods on Etsy.
e.g., I run a B2B SaaS for project management.
e.g., I'm a content creator focused on AI tools."
                        value={localContext}
                        onChange={(e) => setLocalContext(e.target.value)}
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2">The more detail you provide, the more relevant your results will be.</p>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 border border-purple-600 rounded-md hover:bg-purple-700">Save Context</button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<string>('6 months');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
    const [businessContext, setBusinessContext] = useState<string>('');
    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortOrder, setSortOrder] = useState<string>('growth_desc');
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Load subscription info
                try {
                    const info = await fetchSubscriptionInfo();
                    setSubscriptionTier(info.tier);
                } catch (error) {
                    console.error('Error loading subscription info:', error);
                }

                // Load business context from Firestore
                try {
                    const contextDoc = await getDoc(doc(db, 'businessContext', currentUser.uid));
                    if (contextDoc.exists()) {
                        setBusinessContext(contextDoc.data().context || '');
                    }
                } catch (error) {
                    console.error('Error loading business context:', error);
                }
            } else {
                setSubscriptionTier('free');
                setBusinessContext('');
            }
        });

        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        if (!user) return;

        const loadTopics = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const fetchedTopics = await fetchTrendingTopics(timeRange, activeSearchQuery, businessContext, selectedCategory);
                setTopics(fetchedTopics);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                setTopics([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadTopics();
    }, [user, timeRange, activeSearchQuery, businessContext, selectedCategory]);
    
    const sortedTopics = useMemo(() => {
        const sortableTopics = [...topics];
        if (sortOrder === 'growth_desc') {
            sortableTopics.sort((a, b) => b.growth - a.growth);
        } else if (sortOrder === 'growth_asc') {
            sortableTopics.sort((a, b) => a.growth - b.growth);
        }
        return sortableTopics;
    }, [topics, sortOrder]);

    const paginatedTopics = useMemo(() => {
        const startIndex = (currentPage - 1) * topicsPerPage;
        return sortedTopics.slice(startIndex, startIndex + topicsPerPage);
    }, [sortedTopics, currentPage]);

    const hasNextPage = useMemo(() => {
        return currentPage * topicsPerPage < sortedTopics.length;
    }, [sortedTopics, currentPage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setActiveSearchQuery(searchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        setActiveSearchQuery('');
    };
    
    const handleSaveContext = async (newContext: string) => {
        if (!user) return;
        
        if (subscriptionTier === 'free') {
            setIsPanelOpen(true);
            return;
        }

        try {
            // Save to Firestore
            await setDoc(doc(db, 'businessContext', user.uid), {
                context: newContext,
                updatedAt: new Date(),
            });
            setBusinessContext(newContext);
            setCurrentPage(1);
            setSelectedCategory('All');
        } catch (error) {
            console.error('Error saving business context:', error);
            alert('Failed to save business context. Please try again.');
        }
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
        window.scrollTo(0, 0);
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="bg-white/70 p-6 rounded-xl border border-gray-200/80 animate-pulse">
                           <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                           <div className="h-5 bg-gray-300 rounded w-3/4 mb-4"></div>
                           <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                           <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                           <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end">
                                <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
                           </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg container mx-auto mt-10">
                    <h3 className="font-bold text-lg">Oops! Something went wrong.</h3>
                    <p className="mt-1">{error}</p>
                </div>
            );
        }

        if (paginatedTopics.length === 0) {
            return (
                <div className="text-center text-gray-500 py-20">
                    <h3 className="font-semibold text-lg">No topics found</h3>
                    <p className="mt-1">
                        {activeSearchQuery 
                            ? `Try a different search term or clear the search.`
                            : businessContext
                            ? `Try broadening your business description or select a different time range.`
                            : `Try selecting a different time range or category.`
                        }
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedTopics.map(topic => (
                    <TopicCard key={topic.id} topic={topic} />
                ))}
            </div>
        );
    }
    
    const timeRanges = ['1 month', '3 months', '6 months', '1 year', '5 years'];

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#f5f5f7]">
                <Header 
                    onSetBusinessClick={() => setIsPanelOpen(true)} 
                    businessContextIsSet={!!businessContext} 
                    user={user}
                    subscriptionTier={subscriptionTier}
                />
                <BusinessContextPanel 
                    isOpen={isPanelOpen} 
                    onClose={() => setIsPanelOpen(false)} 
                    currentContext={businessContext}
                    onSave={handleSaveContext}
                    subscriptionTier={subscriptionTier}
                />
                <main>
                    <div className="container mx-auto px-6">
                        {subscriptionTier === 'free' && (
                            <div className="py-6">
                                <Subscription />
                            </div>
                        )}

                        <section className="text-center py-16 md:py-24">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#1d1d1f]">
                                {activeSearchQuery 
                                    ? `Results for "${activeSearchQuery}"` 
                                    : businessContext 
                                    ? "Trending topics for your business" 
                                    : "Discover what's next"
                                }
                            </h2>
                            <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-600">
                                 {businessContext 
                                    ? "AI-powered opportunities tailored to your specific business."
                                    : "Find the next big thing before it takes off. Explored by AI."
                                 }
                            </p>
                            <form className="mt-10 max-w-2xl mx-auto" onSubmit={handleSearchSubmit}>
                                <div className="relative flex shadow-md rounded-xl">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                                        <SearchIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="search"
                                        placeholder="Search topics like 'AI Agents' or 'SaaS Boilerplates'"
                                        className="w-full p-4 pl-12 text-base text-[#1d1d1f] border border-gray-200/80 rounded-l-xl bg-white/80 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button type="submit" className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-semibold rounded-r-xl text-sm px-7 py-4 transition-colors">Search</button>
                                </div>
                                {activeSearchQuery && (
                                     <button onClick={handleClearSearch} className="mt-4 text-sm text-purple-600 hover:underline">
                                        Clear search
                                     </button>
                                )}
                            </form>
                        </section>

                        <section className="pb-16">
                            <div className="flex items-center justify-center p-1 mb-8 bg-gray-200/60 rounded-lg max-w-md mx-auto">
                                {timeRanges.map(range => (
                                    <button
                                        key={range}
                                        onClick={() => {
                                            if (timeRange !== range) {
                                                setTimeRange(range);
                                                setCurrentPage(1);
                                            }
                                        }}
                                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
                                            timeRange === range
                                                ? 'bg-white text-[#1d1d1f] shadow'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-4 mb-10 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/80">
                                <div className="flex-grow">
                                    <div className="flex items-center flex-wrap gap-2">
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => {
                                                    if (selectedCategory !== category) {
                                                        setSelectedCategory(category);
                                                        setCurrentPage(1);
                                                    }
                                                }}
                                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${
                                                    selectedCategory === category
                                                        ? 'bg-purple-600 text-white shadow'
                                                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900'
                                                }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 lg:border-l lg:pl-6 lg:border-gray-200/80">
                                 <div className="relative">
                                    <select
                                        id="sort-order"
                                        aria-label="Sort topics"
                                        value={sortOrder}
                                        onChange={(e) => {
                                            setSortOrder(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="appearance-none block w-full lg:w-56 pl-3 pr-10 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="growth_desc">Sort by Growth: High to Low</option>
                                        <option value="growth_asc">Sort by Growth: Low to High</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </div>
                                 </div>
                                </div>
                            </div>
                            
                            {renderContent()}

                            {!isLoading && (sortedTopics.length > 0) && (
                                <div className="flex items-center justify-center gap-4 py-12">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1 || isLoading}
                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-500" aria-label={`Current page, Page ${currentPage}`}>
                                        Page {currentPage}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!hasNextPage || isLoading}
                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                        </section>
                    </div>
                </main>
                <footer className="text-center py-10 text-sm text-gray-500 border-t border-gray-200/80 mt-10">
                    <p>&copy; {new Date().getFullYear()} TrendPulse AI. All trends identified by Google Gemini.</p>
                </footer>
            </div>
        </AuthGuard>
    );
};

export default App;

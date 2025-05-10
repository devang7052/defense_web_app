'use client';

import { useState, useEffect } from 'react';
import { getConflictData, updateConflictData, StateStatus, AttackInfo, NewsArticle } from './lib/conflictData';
import IndiaMap from './components/indiaMap';
import AttacksTable from './components/attackTable';
import NewsArticlesList from './components/newsArticleList';
import LoadingSpinner from './components/loadingSpinner';

interface ConflictData {
  stateStatuses: StateStatus[];
  attacks: AttackInfo[];
  articles: NewsArticle[];
  lastUpdated: number;
}

export default function Home() {
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to load data
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getConflictData();
      setConflictData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load conflict data. Please try again later.');
      console.error('Error loading conflict data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh data
  const refreshData = async () => {
    try {
      setUpdating(true);
      const data = await updateConflictData();
      setConflictData(data);
      setError(null);
    } catch (err) {
      setError('Failed to update conflict data. Please try again later.');
      console.error('Error updating conflict data:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Load data on initial mount
  useEffect(() => {
    loadData();
    
    // Set up interval to refresh data every 30 minutes
    const intervalId = setInterval(() => {
      refreshData();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format the last updated time
  const formatLastUpdated = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
        <LoadingSpinner />
        <h2 className="mt-4 text-xl">Loading conflict data...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
        <div className="p-6 bg-red-50 rounded-lg shadow-md max-w-2xl w-full text-center">
          <h2 className="text-2xl font-semibold text-red-700 mb-4">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            India-Pakistan Conflict Monitoring
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <p className="text-slate-600">
              Last updated: {conflictData ? formatLastUpdated(conflictData.lastUpdated) : 'Unknown'}
            </p>
            <button
              onClick={refreshData}
              disabled={updating}
              className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center"
            >
              {updating ? (
                <>
                  <span className="mr-2">Updating...</span>
                  <LoadingSpinner size="small" />
                </>
              ) : (
                'Refresh Data'
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map section - takes up full width on small screens, 2/3 on large */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">State Danger Levels</h2>
            <div className="mb-4 flex flex-wrap gap-4">
              <div className="flex items-center">
                <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                <span>High Danger</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-orange-400 rounded-full mr-2"></span>
                <span>Moderate</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                <span>Neutral</span>
              </div>
            </div>
            {conflictData && (
              <IndiaMap stateStatuses={conflictData.stateStatuses} />
            )}
          </div>

          {/* Right side column for attacks and news */}
          <div className="space-y-8">
            {/* Attacks section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Current Attacks</h2>
              {conflictData && conflictData.attacks.length > 0 ? (
                <AttacksTable attacks={conflictData.attacks} />
              ) : (
                <p className="text-slate-600">No current attacks reported</p>
              )}
            </div>

            {/* News section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Recent Articles</h2>
              {conflictData && conflictData.articles.length > 0 ? (
                <NewsArticlesList articles={conflictData.articles} />
              ) : (
                <p className="text-slate-600">No relevant articles found</p>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Data is refreshed automatically every 30 minutes. Sources include Times of India, Hindustan Times, and other trusted Indian news outlets.</p>
          <p className="mt-1">This is for informational purposes only. In case of emergency, follow official government advisories.</p>
        </footer>
      </div>
    </main>
  );
}
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
    
    // Set up interval to update data in Firebase every 30 minutes
    const intervalId = setInterval(async () => {
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
    <main className="min-h-screen p-4 md:p-6 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            India-Pakistan Conflict Monitor
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <p className="text-slate-600 text-sm">
              Last updated: {conflictData ? formatLastUpdated(conflictData.lastUpdated) : 'Unknown'}
            </p>
            <button
              onClick={refreshData}
              disabled={updating}
              className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center"
            >
              {updating ? (
                <>
                  <span className="mr-2">Updating...</span>
                  <LoadingSpinner size="small" />
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Map section - takes up full width on small screens, 2/3 on large */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">State Security Status</h2>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  <span className="text-xs text-gray-700">High Danger</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-orange-400 rounded-full mr-1"></span>
                  <span className="text-xs text-gray-700">Moderate</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  <span className="text-xs text-gray-700">Neutral</span>
                </div>
              </div>
            </div>
            {conflictData && (
              <IndiaMap stateStatuses={conflictData.stateStatuses} />
            )}
          </div>

          {/* Right side column for attacks and news */}
          <div className="space-y-4 md:space-y-6">
            {/* Attacks section */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-900">Current Incidents</h2>
                <div className="bg-red-100 text-xs text-red-800 px-2 py-1 rounded-full">
                  {conflictData?.attacks.length || 0} reported
                </div>
              </div>
              {conflictData && conflictData.attacks.length > 0 ? (
                <AttacksTable attacks={conflictData.attacks} />
              ) : (
                <p className="text-slate-600 text-sm italic text-center py-4">No incidents reported</p>
              )}
            </div>

            {/* News section */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-900">Latest News</h2>
                <a 
                  href="#" 
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    refreshData();
                  }}
                >
                  See all
                  <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
              {conflictData && conflictData.articles.length > 0 ? (
                <NewsArticlesList articles={conflictData.articles} />
              ) : (
                <p className="text-slate-600 text-sm italic text-center py-4">No relevant articles found</p>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-6 md:mt-8 bg-white rounded-lg shadow-sm p-4 text-center text-slate-500 text-xs">
          <p>Data is refreshed automatically every 30 minutes. Sources include Times of India, Hindustan Times, and other trusted Indian news outlets.</p>
          <p className="mt-1">This is for informational purposes only. In case of emergency, follow official government advisories.</p>
        </footer>
      </div>
    </main>
  );
}
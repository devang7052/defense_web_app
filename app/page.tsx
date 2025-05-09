'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  [key: string]: any;
}

interface TestResults {
  firebase?: TestResult;
  newsApi?: TestResult;
  ai?: TestResult;
}

export default function Home() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testServices() {
      try {
        const response = await fetch('/api/test-services');
        
        if (!response.ok) {
          throw new Error('Failed to test services');
        }
        
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    testServices();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Service Initialization Test</h1>
      
      {loading && <div className="text-xl">Testing services...</div>}
      
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          Error: {error}
        </div>
      )}
      
      {results && (
        <div className="w-full max-w-2xl space-y-6">
          <ServiceCard
            name="Firebase"
            result={results.firebase}
          />
          
          <ServiceCard
            name="NewsAPI"
            result={results.newsApi}
          />
          
          <ServiceCard
            name="AI Service (Google Gemini)"
            result={results.ai}
          />
        </div>
      )}
    </main>
  );
}

function ServiceCard({ name, result }: { name: string; result?: TestResult }) {
  if (!result) return null;

  return (
    <div className={`p-6 rounded-lg shadow-md ${
      result.success ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <p className={`text-lg ${
        result.success ? 'text-green-700' : 'text-red-700'
      }`}>
        {result.message}
      </p>
      
      {/* Show additional details if available */}
      {result.articles && (
        <p className="mt-2">Found {result.articles} articles</p>
      )}
      
      {result.response && (
        <div className="mt-2">
          <p className="font-medium">AI response:</p>
          <p className="mt-1 p-2 bg-gray-100 rounded">{result.response}</p>
        </div>
      )}
    </div>
  );
}
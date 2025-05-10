import { NextResponse } from 'next/server';
import axios from 'axios';
import { INDIAN_STATES } from '../../lib/conflictData';

// Define general conflict queries
const GENERAL_QUERIES = [
  'India Pakistan conflict latest',
  'India Pakistan border skirmish',
  'India Pakistan military tension',
  'India Pakistan ceasefire violation',
  'India Pakistan missile threat',
  'India border security alert'
];

// Function to fetch articles for a single query
async function fetchArticlesForQuery(query: string, apiKey: string) {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        apiKey,
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 2, // Get top 2 articles for each query
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
      }
    });
    
    if (response.data.status !== 'ok' || !response.data.articles) {
      return [];
    }
    
    return response.data.articles;
  } catch (error) {
    console.error(`Error fetching articles for query "${query}":`, error);
    return [];
  }
}

export async function GET() {
  try {
    const newsApiKey = process.env.NEWS_API_KEY || '';
    
    if (!newsApiKey) {
      console.error('NewsAPI key is missing');
      return NextResponse.json(
        { error: 'API key is missing' }, 
        { status: 500 }
      );
    }
    
    // Create queries for each state's current condition
    const stateQueries = INDIAN_STATES.map(state => `${state} current condition Pakistan`);
    
    // Combine general queries and state-specific queries
    const allQueries = [...GENERAL_QUERIES, ...stateQueries];
    
    // Fetch articles for all queries
    const allArticlesPromises = allQueries.map(query => 
      fetchArticlesForQuery(query, newsApiKey)
    );
    
    const allArticlesResults = await Promise.all(allArticlesPromises);
    
    // Combine all articles
    let allArticles = allArticlesResults.flat();
    
    // Remove duplicates based on URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.url, article])).values()
    );
    
    // Filter for relevant articles
    const relevantArticles = uniqueArticles.filter(article => {
      if (!article.title) return false;
      
      const title = article.title.toLowerCase();
      const description = (article.description || '').toLowerCase();
      const content = (article.content || '').toLowerCase();
      const allText = title + ' ' + description + ' ' + content;
      
      // Enhanced relevance keywords
      const conflictKeywords = [
        // Pakistan-related terms
        'pakistan', 'pakistani', 'islamabad', 'cross-border',
        
        // Conflict-related terms
        'conflict', 'war', 'tension', 'military', 'battle',
        'ceasefire', 'violation', 'attack', 'security', 'defense',
        'loc', 'line of control', 'border',
        
        // Threat-related terms
        'missile', 'terror', 'terrorist', 'threat', 'alert',
        'weapon', 'bomb', 'explosives', 'artillery',
        
        // State-related terms
        'jammu', 'kashmir', 'punjab', 'rajasthan', 'gujarat',
        'indian state', 'border state', 'security forces',
        
        // Incident types
        'skirmish', 'shelling', 'firing', 'infiltration',
        'militant', 'army', 'bsf', 'crpf', 'casualties'
      ];
      
      return conflictKeywords.some(term => allText.includes(term));
    });
    
    // Sort by published date (newest first)
    relevantArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Extract small summaries for each article to reduce token usage
    const summarizedArticles = relevantArticles.map(article => {
      return {
        title: article.title,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt,
        url: article.url,
        summary: article.description || article.content?.substring(0, 200) || 'No content available'
      };
    });
    
    return NextResponse.json({
      status: 'ok',
      totalResults: summarizedArticles.length,
      articles: summarizedArticles
    });
    
  } catch (error) {
    console.error('Error in news API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}
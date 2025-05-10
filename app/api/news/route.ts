import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const newsApiKey = process.env.NEWS_API_KEY || '';
    
    // Check if API key is available
    if (!newsApiKey || newsApiKey === '') {
      console.error('NewsAPI key is missing. Set NEWS_API_KEY in your environment variables.');
      return NextResponse.json(
        { error: 'API key is missing. Please configure your NewsAPI key.' }, 
        { status: 500 }
      );
    }
    
    try {
      // Hardcoded search query for India-Pakistan conflict news
      const searchQuery = 'india pakistan conflict';
      
      // Make direct API call with hardcoded parameters
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          apiKey: newsApiKey,
          q: searchQuery,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 30
        }
      });
      
      if (response.data.status !== 'ok' || !response.data.articles) {
        throw new Error('Invalid response from NewsAPI');
      }
      
      // Filter for articles that are likely about India-Pakistan conflict
      const relevantArticles = response.data.articles.filter((article: { title: string; description: any; content: any; }) => {
        // Don't include articles without titles
        if (!article.title) return false;
        
        const title = article.title.toLowerCase();
        const description = (article.description || '').toLowerCase();
        const content = (article.content || '').toLowerCase();
        const allText = title + ' ' + description + ' ' + content;
        
        // Define relevance keywords for filtering
        const conflictKeywords = [
          'pakistan', 'border', 'conflict', 'war', 'tension', 'military',
          'ceasefire', 'violation', 'attack', 'security', 'defense',
          'loc', 'line of control', 'kashmir', 'missile', 'terror'
        ];
        
        // Check if at least one conflict keyword is present
        return conflictKeywords.some(term => allText.includes(term));
      });
      
      return NextResponse.json({
        status: 'ok',
        query: searchQuery,  // Return the actual search query used
        totalResults: relevantArticles.length,
        articles: relevantArticles
      });
    } catch (apiError) {
      console.error('Error fetching from NewsAPI:', apiError);
      
      return NextResponse.json(
        { error: 'Failed to fetch news from NewsAPI. Please try again later.' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in news API route:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' }, 
      { status: 500 }
    );
  }
}
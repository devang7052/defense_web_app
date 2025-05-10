import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with your API key
const geminiApiKey = process.env.GEMINI_API_KEY || '';
export const genAIInstance = new GoogleGenerativeAI(geminiApiKey);

// 5. Create a utility to test all services (app/lib/services-test.ts)
import { db } from './firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { fetchEverything, fetchTopHeadlines } from './newsapi';
import { genAIInstance as genAI } from './ai';
import axios from 'axios';

export async function testFirebase() {
  try {
    // Try to query a collection to verify Firebase is working
    const testQuery = query(collection(db, 'test'), limit(1));
    await getDocs(testQuery);
    return { success: true, message: 'Firebase initialized successfully' };
  } catch (error) {
    console.error('Firebase test error:', error);
    return { success: false, message: `Firebase initialization failed: ${error}` };
  }
}

export async function testNewsApi() {
  try {
    // First try with top headlines
    console.log('Testing NewsAPI with top headlines...');
    const response = await fetchTopHeadlines({
      language: 'en',
      country: 'us'
    });
    
    // If top headlines didn't return any articles, try the everything endpoint
    if (!response.articles || response.articles.length === 0) {
      console.log('No articles found with top headlines, trying everything endpoint...');
      const everythingResponse = await fetchEverything({
        query: 'news',
        language: 'en'
      });
      
      if (everythingResponse.articles && everythingResponse.articles.length > 0) {
        return { 
          success: true, 
          message: 'NewsAPI initialized successfully (using everything endpoint)', 
          articles: everythingResponse.articles.length,
          endpoint: 'everything'
        };
      }
    } else {
      return { 
        success: true, 
        message: 'NewsAPI initialized successfully (using top headlines)', 
        articles: response.articles.length,
        endpoint: 'top-headlines'
      };
    }
    
    // If we still don't have articles, check if we got a valid API response
    if (response.status === 'ok' || (response.status && response.totalResults !== undefined)) {
      return { 
        success: true, 
        message: 'NewsAPI initialized successfully but no articles were found',
        totalResults: response.totalResults || 0
      };
    }
    
    // Something's not right
    return { 
      success: false, 
      message: 'NewsAPI initialized but returned no articles and unexpected response format',
      response: JSON.stringify(response).substring(0, 100) + '...'
    };
  } catch (error) {
    // Check if this is a 401/403 error which typically indicates API key issues
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        return { 
          success: false, 
          message: `NewsAPI authentication failed: ${error.response.status} ${error.response.statusText}. Check your API key.` 
        };
      } else if (error.response.status === 429) {
        return { 
          success: false, 
          message: `NewsAPI rate limit exceeded: ${error.response.status} ${error.response.statusText}. Try again later.` 
        };
      }
    }
    
    console.error('NewsAPI test error:', error);
    return { 
      success: false, 
      message: `NewsAPI initialization failed: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

export async function testAI() {
  try {
    // Test the Gemini API with a simple text generation
    // Using gemini-1.5-flash, which should be available
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello, respond with just one word." }] }]
    });
    
    const response = result.response;
    
    return { 
      success: true, 
      message: 'Gemini AI initialized successfully', 
      response: response.text() 
    };
  } catch (error) {
    console.error('AI test error:', error);
    return { success: false, message: `Gemini AI initialization failed: ${error}` };
  }
}
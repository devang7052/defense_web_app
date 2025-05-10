import { db } from './firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { genAIInstance as genAI } from './ai';
import { fetchTopHeadlines } from './newsapi';

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
      // Test the News API with a simple query
      const response = await fetchTopHeadlines({
        language: 'en',
        country: 'us'
      });
      return { 
        success: true, 
        message: 'NewsAPI initialized successfully', 
        articles: response.articles.length
      };
    } catch (error) {
      console.error('NewsAPI test error:', error);
      return { success: false, message: `NewsAPI initialization failed: ${error}` };
    }
  }
  

  export async function testAI() {
    try {
      // Test the Gemini API with a simple text generation
      // Using gemini-pro instead of gemini-1.5-pro to avoid quota issues
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = "Hello, respond with just one word to confirm you're working.";
      
      const result = await model.generateContent(prompt);
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
  
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { analyzeNewsWithAI } from './aiService';

// Define types for our conflict data
export interface StateStatus {
  name: string;
  dangerLevel: 'danger' | 'moderate' | 'neutral';
  description: string;
  lastUpdated: number;
}

export interface AttackInfo {
  city: string;
  state: string;
  description: string;
  timestamp: number;
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface ConflictData {
  stateStatuses: StateStatus[];
  attacks: AttackInfo[];
  articles: NewsArticle[];
  lastUpdated: number;
}

// Indian states list for reference
export const INDIAN_STATES = [
  // Border states with Pakistan (higher priority)
  'Jammu and Kashmir', 'Punjab', 'Rajasthan', 'Gujarat',
  // Other states
  'Himachal Pradesh', 'Uttarakhand', 'Haryana', 'Delhi', 'Uttar Pradesh',
  'Madhya Pradesh', 'Maharashtra', 'Telangana', 'Andhra Pradesh',
  'Karnataka', 'Tamil Nadu', 'Kerala', 'Goa', 'Chhattisgarh', 'Odisha',
  'Jharkhand', 'Bihar', 'West Bengal', 'Sikkim', 'Assam', 'Meghalaya',
  'Tripura', 'Mizoram', 'Manipur', 'Nagaland', 'Arunachal Pradesh'
];

/**
 * Fetch news articles from our server
 */
async function fetchNews(): Promise<NewsArticle[]> {
  try {
    // Fetch news using our server-side API
    const response = await fetch('/api/news');
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map to our NewsArticle format
    return (data.articles || []).slice(0, 20).map((article: any) => ({
      title: article.title || 'No title',
      source: article.source?.name || 'Unknown source',
      url: article.url || '#',
      publishedAt: article.publishedAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    // Return empty array if fetch fails
    return [];
  }
}

/**
 * Store conflict data in Firebase
 */
async function storeConflictData(data: ConflictData): Promise<void> {
  try {
    // Store each state status separately
    for (const state of data.stateStatuses) {
      await setDoc(doc(db, 'stateStatuses', state.name), state);
    }
    
    // Store attacks
    for (const attack of data.attacks) {
      const attackId = `${attack.city}_${attack.timestamp}`;
      await setDoc(doc(db, 'attacks', attackId), attack);
    }
    
    // Store articles
    for (const article of data.articles) {
      const articleId = Buffer.from(article.url).toString('base64').substring(0, 20);
      await setDoc(doc(db, 'articles', articleId), article);
    }
    
    // Store last updated timestamp
    await setDoc(doc(db, 'metadata', 'lastUpdate'), {
      timestamp: data.lastUpdated
    });
    
    console.log('Successfully stored conflict data to Firebase');
  } catch (error) {
    console.error('Error storing conflict data:', error);
  }
}

/**
 * Create default data if nothing exists
 */
function createDefaultData(): ConflictData {
  const timestamp = Date.now();
  return {
    stateStatuses: [],  
    attacks:  [],
    articles: [],
    lastUpdated: timestamp
  };
}

/**
 * Fetch latest conflict data from Firebase
 */
export async function getConflictData(): Promise<ConflictData> {
  try {
    // First, check if there's any data in Firebase
    const stateStatusesSnapshot = await getDocs(collection(db, 'stateStatuses'));
    
    // If no state statuses exist yet, create and store default data
    if (stateStatusesSnapshot.empty) {
      console.log('No existing data found');
      // const defaultData = createDefaultData();
      // await storeConflictData(defaultData);
      // return defaultData;
    }
    
    // Get state statuses
    const stateStatuses: StateStatus[] = [];
    stateStatusesSnapshot.forEach(doc => {
      stateStatuses.push(doc.data() as StateStatus);
    });
    
    // Get attacks (most recent first)
    const attacksQuery = query(collection(db, 'attacks'), orderBy('timestamp', 'desc'), limit(20));
    const attacksSnapshot = await getDocs(attacksQuery);
    const attacks: AttackInfo[] = [];
    attacksSnapshot.forEach(doc => {
      attacks.push(doc.data() as AttackInfo);
    });
    
    // Get articles (most recent first)
    const articlesQuery = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(10));
    const articlesSnapshot = await getDocs(articlesQuery);
    const articles: NewsArticle[] = [];
    articlesSnapshot.forEach(doc => {
      articles.push(doc.data() as NewsArticle);
    });
    
    // Get last updated timestamp
    const metadataSnapshot = await getDocs(collection(db, 'metadata'));
    let lastUpdated = Date.now();
    metadataSnapshot.forEach(doc => {
      if (doc.id === 'lastUpdate') {
        lastUpdated = doc.data().timestamp;
      }
    });
    
    console.log(`Successfully retrieved data with ${stateStatuses.length} states, ${attacks.length} attacks, and ${articles.length} articles`);
    
    return {
      stateStatuses,
      attacks,
      articles,
      lastUpdated
    };
  } catch (error) {
    console.error('Error getting conflict data:', error);
    // Return default data if retrieval fails
    return createDefaultData();
  }
}

/**
 * Main function to update conflict data
 */
export async function updateConflictData(): Promise<ConflictData> {
  try {
    console.log('Starting conflict data update process');
    
    // Fetch news
    const articles = await fetchNews();
    console.log(`Fetched ${articles.length} news articles`);
    
    // Even if we don't have articles, continue with empty array
    const timestamp = Date.now();
    
    // Analyze with AI or use mock data
    const analysis = await analyzeNewsWithAI(articles);
    console.log(`Generated analysis with ${analysis.stateStatuses.length} states and ${analysis.attacks.length} attacks`);
    
    // Combine everything into our final data structure
    const conflictData: ConflictData = {
      stateStatuses: analysis.stateStatuses,
      attacks: analysis.attacks,
      articles,
      lastUpdated: timestamp
    };
    
    // Store in Firebase
    await storeConflictData(conflictData);
    
    return conflictData;
  } catch (error) {
    console.error('Error in updateConflictData:', error);
    
    // If update fails, get existing data from Firebase or use default
    try {
      return await getConflictData();
    } catch (innerError) {
      console.error('Error getting fallback data:', innerError);
      return createDefaultData();
    }
  }
}
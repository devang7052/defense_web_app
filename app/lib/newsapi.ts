import axios from 'axios';

const newsApiKey = process.env.NEWS_API_KEY || '';

// Custom function to fetch news using axios instead of the NewsAPI package
export async function fetchTopHeadlines({ country = 'us', language = 'en', category = '' } = {}) {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        apiKey: newsApiKey,
        country,
        language,
        category,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

export async function fetchEverything({ query = 'news', language = 'en' } = {}) {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        apiKey: newsApiKey,
        q: query,
        language,
        pageSize: 10,
        sortBy: 'publishedAt'
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching everything:', error);
    throw error;
  }
}
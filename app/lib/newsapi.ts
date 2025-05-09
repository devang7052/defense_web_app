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
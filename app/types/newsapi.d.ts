declare module 'newsapi' {
    interface Article {
      source: {
        id: string | null;
        name: string;
      };
      author: string | null;
      title: string;
      description: string | null;
      url: string;
      urlToImage: string | null;
      publishedAt: string;
      content: string | null;
    }
  
    interface NewsAPIResponse {
      status: string;
      totalResults: number;
      articles: Article[];
    }
  
    class NewsAPI {
      constructor(apiKey: string);
      v2: {
        topHeadlines(params: {
          country?: string;
          category?: string;
          sources?: string;
          q?: string;
          pageSize?: number;
          page?: number;
        }): Promise<NewsAPIResponse>;
        everything(params: {
          q?: string;
          sources?: string;
          domains?: string;
          from?: string;
          to?: string;
          language?: string;
          sortBy?: string;
          pageSize?: number;
          page?: number;
        }): Promise<NewsAPIResponse>;
      };
    }
  
    export default NewsAPI;
  }
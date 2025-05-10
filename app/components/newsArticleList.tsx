import { NewsArticle } from "../lib/conflictData";

interface NewsArticlesListProps {
  articles: NewsArticle[];
}

export default function NewsArticlesList({ articles }: NewsArticlesListProps) {
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block group"
          >
            <h3 className="text-lg font-medium text-blue-600 group-hover:text-blue-800 transition">
              {article.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span className="font-medium">{article.source}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}
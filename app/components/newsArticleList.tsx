import { useState } from "react";
import { NewsArticle } from "../lib/conflictData";

interface NewsArticlesListProps {
  articles: NewsArticle[];
}

export default function NewsArticlesList({ articles }: NewsArticlesListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const toggleExpanded = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
  };

  return (
    <div className="space-y-2 max-h-[500px] overflow-auto pr-1">
      {articles.map((article, index) => (
        <div 
          key={index} 
          className="border-l-2 border-blue-500 bg-white hover:bg-blue-50 rounded-md shadow-sm transition-colors duration-200"
        >
          <div 
            className="p-3 cursor-pointer"
            onClick={() => toggleExpanded(index)}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                {article.title}
              </h3>
              <svg 
                className={`flex-shrink-0 ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 ${expandedId === index ? 'transform rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span className="font-medium truncate max-w-[100px]">{article.source}</span>
              <span className="mx-1">•</span>
              <span className="text-xs">{formatDate(article.publishedAt)}</span>
            </div>
          </div>

          {expandedId === index && (
            <div className="px-3 pb-3">
              {article.summary && (
                <p className="text-xs text-gray-600 mb-2">{article.summary}</p>
              )}
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Read full article
                <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
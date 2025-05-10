import { useState } from "react";
import { AttackInfo } from "../lib/conflictData";

interface AttacksTableProps {
  attacks: AttackInfo[];
}

export default function AttacksTable({ attacks }: AttacksTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Format the timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
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
    <ul className="divide-y divide-gray-200 max-h-96 overflow-auto">
      {attacks.map((attack, index) => (
        <li 
          key={index} 
          className="py-2 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div 
            onClick={() => toggleExpanded(index)}
            className="flex items-center justify-between px-2"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{attack.city}</p>
                <p className="text-xs text-gray-500">{attack.state}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">{formatTimestamp(attack.timestamp)}</span>
              <svg 
                className={`ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ${expandedId === index ? 'transform rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {expandedId === index && (
            <div className="mt-2 px-2 py-3 bg-gray-50 rounded-md text-sm text-gray-700 border-l-2 border-red-500 ml-5">
              <p>{attack.description}</p>
              
              {attack.sourceArticleUrl && (
                <a
                  href={attack.sourceArticleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-xs font-medium text-red-600 hover:text-red-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  View source article
                  <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </a>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
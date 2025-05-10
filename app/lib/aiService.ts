import { genAIInstance as genAI } from './ai';
import { StateStatus, AttackInfo, NewsArticle } from './conflictData';

// Indian states list with special focus on border states
const INDIAN_STATES = [
  // Border states with Pakistan (higher priority)
  'Jammu and Kashmir', 'Punjab', 'Rajasthan', 'Gujarat',
  // Other states
  'Himachal Pradesh', 'Uttarakhand', 'Haryana', 'Delhi', 'Uttar Pradesh',
  'Madhya Pradesh', 'Maharashtra', 'Telangana', 'Andhra Pradesh',
  'Karnataka', 'Tamil Nadu', 'Kerala', 'Goa', 'Chhattisgarh', 'Odisha',
  'Jharkhand', 'Bihar', 'West Bengal', 'Sikkim', 'Assam', 'Meghalaya',
  'Tripura', 'Mizoram', 'Manipur', 'Nagaland', 'Arunachal Pradesh'
];

interface AiAnalysisResult {
  stateStatuses: StateStatus[];
  attacks: AttackInfo[];
}

/**
 * Tests the Gemini AI connection
 */
export async function testAI(): Promise<boolean> {
  try {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error("AI test failed: API key is missing");
      return false;
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Test");
    return !!result;
  } catch (error) {
    console.error("AI test failed:", error);
    return false;
  }
}

/**
 * Analyze news articles with Gemini AI and throw errors instead of using mock data
 */
export async function analyzeNewsWithAI(articles: NewsArticle[]): Promise<AiAnalysisResult> {
  // Default data only in case of no articles (not an error condition)
  if (articles.length === 0) {
    const timestamp = Date.now();
    return {
      stateStatuses: INDIAN_STATES.map(state => ({
        name: state,
        dangerLevel: 'neutral',
        description: 'No relevant information available',
        lastUpdated: timestamp
      })),
      attacks: []
    };
  }
  
  // Check if API key is configured
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Set NEXT_PUBLIC_GEMINI_API_KEY in your environment.");
  }
  
  // Check if AI is available
  const isAiAvailable = await testAI().catch(() => false);
  
  if (!isAiAvailable) {
    throw new Error("AI service unavailable. Please check your API key and try again later.");
  }
  
  // Prepare articles data for analysis with index for reference
  const indexedArticles = articles.map((article, index) => {
    return `[Article ${index + 1}]\nTitle: ${article.title || ''}\nSource: ${article.source || ''}\nPublished: ${article.publishedAt || ''}\nSummary: ${article.summary || ''}\nURL: ${article.url || ''}\n\n`;
  }).join('').substring(0, 20000); // Limit text length to avoid token limits
  
  // Create AI prompt
  const prompt = `
You are a security analyst specializing in the India-Pakistan conflict. Analyze these news articles and provide:

1. A detailed security assessment for EACH Indian state with their danger levels:
   - "danger": Active conflict, direct attacks, missile threats, or high tension with Pakistan
   - "moderate": Increased security measures, border tensions, military deployment, or indirect threats
   - "neutral": Normal conditions with no significant conflict activity or threats
   - description should have the details of the city where it is happening in the state and should be in detail

2. List ONLY major incidents directly related to the India-Pakistan conflict (maximum 10 incidents):
   - Focus ONLY on significant events such as:
     * Cross-border attacks
     * Military confrontations
     * Terrorist incidents linked to Pakistan
     * Missile/artillery exchanges
     * Major security breaches at the border
   - DO NOT include minor incidents, political statements, or non-violent events
   - Each incident must include:
     * Exact city name
     * State name 
     * Detailed description (casualties, damage, military response)
     * Source article number that reported this incident (e.g., "Article 3")

Guidelines for categorization:
- If a state has missile threats, attacks, or active conflict with Pakistan → danger
- If a state has increased security, military deployment, or mentions of Pakistan threats → moderate
- If a state has no security concerns or Pakistan-related issues → neutra
- Border states (Jammu and Kashmir, Punjab, Rajasthan, Gujarat) should have higher scrutiny

Format your response as valid JSON with this structure:
{
  "states": [
    {
      "name": "State Name",
      "dangerLevel": "danger|moderate|neutral",
      "description": "Detailed security assessment with specific details"
    }
  ],
  "attacks": [
    {
      "city": "City Name",
      "state": "State Name",
      "description": "Detailed description of the attack or incident",
      "sourceArticle": 3
    }
  ]
}

Here are the articles:
${indexedArticles}
`;

  try {
    // Use Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON. Invalid response format.");
    }
    
    const jsonStr = jsonMatch[0];
    let aiAnalysis;
    
    try {
      aiAnalysis = JSON.parse(jsonStr);
    } catch (Error) {
      throw console.error(`Failed to parse AI response: ${Error}`);
    }
    
    // Create timestamp for this update
    const timestamp = Date.now();
    
    // Format state statuses, ensuring we have all states
    const aiStates = new Map();
    (aiAnalysis.states || []).forEach((state: any) => {
      aiStates.set(state.name, {
        ...state,
        lastUpdated: timestamp
      });
    });
    
    const stateStatuses: StateStatus[] = INDIAN_STATES.map(stateName => {
      if (aiStates.has(stateName)) {
        return aiStates.get(stateName);
      }
      return {
        name: stateName,
        dangerLevel: 'neutral',
        description: 'No current reports of conflict',
        lastUpdated: timestamp
      };
    });
    
    // Format attacks with source article URLs
    const attacks: AttackInfo[] = (aiAnalysis.attacks || []).map((attack: any) => {
      // Get the source article URL if available
      let sourceArticleUrl = '';
      if (attack.sourceArticle && articles[attack.sourceArticle - 1]) {
        sourceArticleUrl = articles[attack.sourceArticle - 1].url || '';
      }
      
      return {
        city: attack.city,
        state: attack.state,
        description: attack.description,
        timestamp,
        sourceArticleUrl
      };
    });
    
    return {
      stateStatuses,
      attacks
    };
  } catch (error) {
    // Propagate error without falling back to mock data
    console.error('Error using AI:', error);
    throw error;
  }
}
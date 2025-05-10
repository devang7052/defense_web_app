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
  
  // Prepare articles data for analysis
  const articlesText = articles.map(article => {
    return `Title: ${article.title || ''}\nSource: ${article.source || ''}\nPublished: ${article.publishedAt || ''}\n\n`;
  }).join('').substring(0, 20000); // Limit text length to avoid token limits
  
  // Create AI prompt
  const prompt = `
Based on these news articles about the India-Pakistan conflict, provide:

1. A list of Indian states with their danger levels (danger/moderate/neutral)
2. A list of current attacks or incidents

Format your response as valid JSON with this structure:
{
  "states": [
    {
      "name": "State Name",
      "dangerLevel": "danger|moderate|neutral",
      "description": "Brief explanation"
    }
  ],
  "attacks": [
    {
      "city": "City Name",
      "state": "State Name",
      "description": "Description"
    }
  ]
}

Here are the articles:
${articlesText}
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
    
    // Format attacks
    const attacks: AttackInfo[] = (aiAnalysis.attacks || []).map((attack: any) => ({
      ...attack,
      timestamp
    }));
    
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
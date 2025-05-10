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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Test");
    return !!result;
  } catch (error) {
    console.error("AI test failed:", error);
    return false;
  }
}

/**
 * Generate fallback mock data when AI is unavailable
 */
export function generateMockData(articles: NewsArticle[]): AiAnalysisResult {
  const timestamp = Date.now();
  
  // Generate mock state statuses
  const stateStatuses: StateStatus[] = [];
  
  // Set border states as moderate or danger based on simple logic
  for (const state of INDIAN_STATES) {
    let dangerLevel: 'danger' | 'moderate' | 'neutral' = 'neutral';
    let description = 'No current reports of conflict';
    
    // Border states with Pakistan are more likely to be in danger
    if (['Jammu and Kashmir', 'Punjab', 'Rajasthan', 'Gujarat'].includes(state)) {
      // Simple logic: if we have articles, make some border states in danger
      if (articles.length > 0) {
        if (state === 'Jammu and Kashmir') {
          dangerLevel = 'danger';
          description = 'High military activity reported near border areas';
        } else {
          dangerLevel = 'moderate';
          description = 'Increased security measures due to border tensions';
        }
      }
    }
    
    stateStatuses.push({
      name: state,
      dangerLevel,
      description,
      lastUpdated: timestamp
    });
  }
  
  // Generate mock attacks if we have articles
  const attacks: AttackInfo[] = [];
  if (articles.length > 0) {
    attacks.push({
      city: 'Srinagar',
      state: 'Jammu and Kashmir',
      description: 'Reported military activity near Line of Control',
      timestamp
    });
  }
  
  return {
    stateStatuses,
    attacks
  };
}

/**
 * Analyze news articles with Gemini AI or fallback to mock data
 */
export async function analyzeNewsWithAI(articles: NewsArticle[]): Promise<AiAnalysisResult> {
  // Default data in case of no articles or AI failure
  const defaultData: AiAnalysisResult = {
    stateStatuses: INDIAN_STATES.map(state => ({
      name: state,
      dangerLevel: 'neutral',
      description: 'No relevant information available',
      lastUpdated: Date.now()
    })),
    attacks: []
  };

  if (articles.length === 0) {
    return defaultData;
  }
  
  // First check if AI is available
  const isAiAvailable = await testAI().catch(() => false);
  
  if (!isAiAvailable) {
    console.log("AI unavailable, using mock data");
    return generateMockData(articles);
  }
  
  try {
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

    // Use Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("AI response did not contain valid JSON, falling back to mock data");
      return generateMockData(articles);
    }
    
    try {
      const jsonStr = jsonMatch[0];
      const aiAnalysis = JSON.parse(jsonStr);
      
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
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return generateMockData(articles);
    }
  } catch (error) {
    console.error('Error using AI:', error);
    return generateMockData(articles);
  }
}
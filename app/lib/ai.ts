import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with your API key
// Use NEXT_PUBLIC_ prefix to make it available in client-side code
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Log a warning if the API key is missing
if (!geminiApiKey) {
  console.warn('⚠️ WARNING: NEXT_PUBLIC_GEMINI_API_KEY is not set. AI features will not work.');
}

// Export the AI instance
export const genAIInstance = new GoogleGenerativeAI(geminiApiKey);

// Test function for the AI service
export async function testAI() {
  try {
    // Validate API key first
    if (!geminiApiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Test the Gemini API with a simple text generation
    const model = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello, respond with just one word." }] }]
    });
    
    const response = result.response;
    
    return { 
      success: true, 
      message: 'Gemini AI initialized successfully', 
      response: response.text() 
    };
  } catch (error) {
    console.error('AI test error:', error);
    return { 
      success: false, 
      message: `Gemini AI initialization failed: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
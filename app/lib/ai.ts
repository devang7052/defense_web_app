import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with your API key
const geminiApiKey = process.env.GEMINI_API_KEY || '';
export const genAI = new GoogleGenerativeAI(geminiApiKey);
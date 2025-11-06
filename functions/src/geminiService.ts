import * as functions from 'firebase-functions';
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || functions.config().gemini?.api_key;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const topicsSchema = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      description: "A list of 100 real trending topics.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique slug-like ID for the topic (e.g., "ai-copilot-builder")' },
          name: { type: Type.STRING, description: 'The name of the trending topic' },
          category: { type: Type.STRING, description: 'The category of the topic (e.g., "AI", "SaaS", "Health")' },
          description: { type: Type.STRING, description: 'A one-sentence compelling description of the topic.' },
          growth: { type: Type.NUMBER, description: 'An estimated percentage number representing search growth over the specified time period.' }
        },
        required: ['id', 'name', 'category', 'description', 'growth']
      }
    }
  },
  required: ['topics']
};

export interface Topic {
  id: string;
  name: string;
  category: string;
  description: string;
  growth: number;
}

export const fetchTrendingTopics = async (
  timeRange: string,
  searchTerm?: string | null,
  businessContext?: string | null,
  category?: string | null
): Promise<Topic[]> => {
  // Validate category parameter
  if (category && typeof category !== 'string') {
    throw new Error('Invalid category parameter. Category must be a string.');
  }

  const basePrompt = `Generate a diverse list of 100 real, "exploding topics" that are showing rapid growth in interest. These should be recent and relevant.`;

  let coreInstruction = '';
  if (businessContext) {
    coreInstruction = `IMPORTANT: The results MUST be highly relevant to the following business context: "${businessContext}". Prioritize niche topics that are direct opportunities for this business over general mainstream trends.`;
  } else if (searchTerm) {
    coreInstruction = `IMPORTANT: All topics MUST be directly related to the search query: "${searchTerm}". The results should be tightly focused on this query. Do not include unrelated topics.`;
  } else {
    coreInstruction = 'Span a diverse range of categories like AI, SaaS, Health & Wellness, E-commerce, FinTech, Gaming, Creator Economy, and Future of Work.';
  }
  
  const categoryPrompt = (category && category !== 'All')
    ? `All topics MUST also belong to the "${category}" category.`
    : '';
    
  const finalPrompt = `
${basePrompt}
${coreInstruction}
${categoryPrompt}

For each topic, provide a unique slug-like id, a name, a category, a short one-sentence description, and an estimated growth percentage over the last ${timeRange}. The growth number should reflect this specific time period.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: topicsSchema,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI service. Please try again.');
    }
    const jsonText = text.trim();
    
    // Validate JSON response
    if (!jsonText) {
      throw new Error('Empty response from AI service. Please try again.');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError: any) {
      console.error('JSON parsing error:', parseError);
      console.error('Response text:', jsonText.substring(0, 500));
      throw new Error(`Failed to parse AI response. The service returned invalid data. Please try again.`);
    }

    const topics = parsed.topics || [];
    
    // Validate topics array
    if (!Array.isArray(topics)) {
      throw new Error('Invalid response format from AI service. Expected an array of topics.');
    }

    if (topics.length === 0) {
      throw new Error('No topics were generated. Please try a different category or time range.');
    }
    
    return topics;
  } catch (error: any) {
    // Re-throw if it's already a formatted error
    if (error.message && error.message.includes('Failed to') || error.message.includes('Invalid')) {
      throw error;
    }

    // Handle API-specific errors
    if (error.message && error.message.includes('API')) {
      throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
    }

    // Handle quota/rate limit errors
    if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
      throw new Error('AI service quota exceeded. Please try again later.');
    }

    // Log the full error for debugging
    console.error("Error fetching trending topics from Gemini:", {
      error: error.message,
      category: category || 'All',
      timeRange,
      stack: error.stack
    });

    // Provide a user-friendly error message
    throw new Error(`Failed to generate topics${category && category !== 'All' ? ` for category "${category}"` : ''}. Please try again or select a different category.`);
  }
};


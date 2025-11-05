import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    const topics = parsed.topics || [];
    
    return topics;
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    throw new Error("Failed to generate topics from AI. Please check your API key and try again.");
  }
};


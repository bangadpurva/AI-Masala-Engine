import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, Recommendation, SocialVibe, Meme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface TrendingData {
  vibes: SocialVibe[];
  memes: Meme[];
}

export async function getTrendingSocialVibes(): Promise<TrendingData> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined, falling back to static data.");
      return { vibes: [], memes: [] };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
        You are the "Masala Cine-Intelligence" expert. 
        Identify 6 of the most robust and culturally significant "Cinematic Vibes" trending today (May 2026).
        Mix 3 high-quality YouTube Video Essays and 3 In-depth Film Blog/Journal articles.
        
        Additionally, identify 4 trending movie-related "Memes" or "Micro-trends" that define the current cinematic humor or critique style. Each meme must be unique in concept.

        Return a JSON object with:
        - "vibes": array of 6 items (name, tag, url, image_keywords, description, platform, videoId, reason).
        - "memes": array of 4 items (title, subtitle, image_keywords, color).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  tag: { type: Type.STRING },
                  url: { type: Type.STRING },
                  image_keywords: { type: Type.STRING },
                  description: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  videoId: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["name", "tag", "url", "image_keywords", "description", "platform", "reason"],
              }
            },
            memes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  image_keywords: { type: Type.STRING },
                  color: { type: Type.STRING },
                },
                required: ["title", "subtitle", "image_keywords", "color"],
              }
            }
          },
          required: ["vibes", "memes"],
        },
      }
    });

    const text = response.text;
    if (!text) return { vibes: [], memes: [] };
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching social vibes:", error);
    return { vibes: [], memes: [] };
  }
}

export async function getRecommendations(prefs: UserPreferences): Promise<Recommendation[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined. Please check your environment settings.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
        You are the "Masala Engine," a world-class cinema expert.
        User Environment:
        - DESIRED EMOTIONAL TONE: "${prefs.customMoodDescription || prefs.mood}"
        - Release Era: ${prefs.yearRange}
        - Content Type: ${prefs.type}s
        - Cinematic Style: ${prefs.genres.length > 0 ? prefs.genres.join(', ') : 'Open to all'}
        - Languages: ${prefs.languages.join(', ')}

        Analyze the user's request and provide the most relevant movie recommendations.
        Include a 'reason' for each recommendation explaining the cinematic link to the requested mood.
        Provide a punchy 'tagline' for each item.

        Return exactly ${prefs.count} items in JSON format.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              ott: { type: Type.STRING },
              reason: { type: Type.STRING },
              tagline: { type: Type.STRING },
              image_keywords: { type: Type.STRING },
              socialHype: { type: Type.STRING },
              trendingTheme: { type: Type.STRING },
            },
            required: ["name", "ott", "reason", "tagline", "image_keywords", "socialHype", "trendingTheme"],
          },
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("The Masala Engine returned an empty response. Please try again!");
    }
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error fetching recommendations:", error);
    const message = error?.message || "Something went wrong in the Masala Kitchen!";
    throw new Error(message);
  }
}


import { GoogleGenAI, Type } from "@google/genai";
import { PlatformMode, RequestProfile, GeneratorResult, PlaylistItem, SortOrder, ManualItem, GroundingSource } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePlaylist = async (
  prompt: string, 
  advancedConfig: Partial<RequestProfile>
): Promise<GeneratorResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Upgraded for professional-grade complex curation tasks
    contents: `
      Act as "The Honest Curator", a world-class editor with obsessive attention to detail and zero tolerance for broken links.
      Analyze the following user request and generate a structured playlist/collection response.
      
      User Request: "${prompt}"
      
      CRITICAL QUANTITY CONSTRAINT:
      - You MUST return EXACTLY ${advancedConfig.targetLength} items. 
      
      EXPLICIT CONSTRAINTS:
      - Platform: ${advancedConfig.platformMode === 'Auto' ? 'Determine from prompt context' : advancedConfig.platformMode}
      - Sort Order: ${advancedConfig.sortOrder}
      - Era: ${advancedConfig.eraConstraint || 'Not specified'}
      - Tone Focus: ${advancedConfig.genderFocus || 'Not specified'}
      - Preferred Authorities: ${advancedConfig.specificSource || 'General high-authority sources'}
      
      Editorial Guidelines:
      1. PLATFORM: Music (Spotify) or Videos (YouTube).
      2. SCORING: Use high editorial standards (0-100). If YouTube, prioritize official channel authority.
      3. HEURISTICS: List 1-3 short tags explaining the selection.
      4. COMMENTARY: Provide a sharp, professional editorial take.
      5. IDS: Provide a valid "platformId". For YouTube, this is exactly 11 characters. 
      6. DESCRIPTION: Write a one-sentence high-fidelity review for each item.
      7. DATE: Include the release year if possible.

      Return the result in valid JSON format.
    `,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          profile: {
            type: Type.OBJECT,
            properties: {
              targetLength: { type: Type.INTEGER },
              sortOrder: { type: Type.STRING },
              platformMode: { type: Type.STRING },
              keywords: { type: Type.STRING },
            },
            required: ["targetLength", "sortOrder", "platformMode", "keywords"]
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                creator: { type: Type.STRING },
                metadata: { type: Type.STRING },
                url: { type: Type.STRING },
                platformId: { type: Type.STRING },
                score: { type: Type.NUMBER },
                description: { type: Type.STRING },
                releaseDate: { type: Type.STRING },
                thumbnail: { type: Type.STRING, nullable: true },
                heuristics: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "title", "creator", "metadata", "score"]
            }
          },
          editorCommentary: { type: Type.STRING },
          vibeScore: { type: Type.NUMBER }
        },
        required: ["profile", "items", "editorCommentary", "vibeScore"]
      }
    }
  });

  // Extract Grounding Chunks as required by guidelines
  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });
  }

  const result = JSON.parse(response.text.trim()) as GeneratorResult;
  return { ...result, sources };
};

export const analyzeManualPlaylist = async (items: ManualItem[]): Promise<GeneratorResult> => {
  const itemListString = items.map(i => `- ${i.title} by ${i.creator}`).join('\n');
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Upgraded for complex analysis
    contents: `
      Act as "The Honest Curator". Review this manual collection:
      ${itemListString}
      
      Rate Vibe Score (0-100), provide sharp commentary, and score each unit.
    `,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          editorCommentary: { type: Type.STRING },
          vibeScore: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                creator: { type: Type.STRING },
                metadata: { type: Type.STRING },
                score: { type: Type.NUMBER },
                description: { type: Type.STRING },
                heuristics: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "title", "creator", "metadata", "score"]
            }
          }
        },
        required: ["editorCommentary", "vibeScore", "items"]
      }
    }
  });

  const raw = JSON.parse(response.text.trim());
  return {
    ...raw,
    profile: {
      targetLength: items.length,
      sortOrder: SortOrder.RELEVANCE,
      platformMode: 'Auto',
      keywords: 'Manual Curation'
    },
    isManualAnalysis: true
  };
};


import { config, hasKey, getApiUrl, getEnv } from "./config";
import { GoogleGenAI } from "@google/genai";
import { Source } from "../types";

interface SearchResult {
  text: string;
  sources: Source[];
  images: string[];
}

// --- Backend Search Implementation (All API Keys Stay in Backend) ---
const backendSearch = async (query: string): Promise<SearchResult> => {
  try {
    // Use our backend endpoint for all search operations
    const response = await fetch(getApiUrl('/api/search'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend Search API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return {
      text: data.text || "",
      sources: data.sources || [],
      images: data.images || []
    };
  } catch (e: any) {
    console.error("Backend Search Failed:", e.message);
    throw new Error(`Backend Search Failed: ${e.message}`);
  }
};

// --- DuckDuckGo Search Implementation (Through Backend) ---
const duckduckgoSearch = async (query: string): Promise<SearchResult> => {
  try {
    // Using DuckDuckGo through the backend proxy
    const response = await fetch(`${getApiUrl('/api/duckduckgo/search')}?query=${encodeURIComponent(query)}&max_results=10`);
    if (response.ok) {
      const data = await response.json();
      
      // Format the response to match SearchResult interface
      const textResults = data.results?.map((r: any) => `\nTitle: ${r.title}\nContent: ${r.content}`).join('') || '';
      const sources = data.results?.map((r: any) => ({ title: r.title, uri: r.url })) || [];
      const images = data.images || [];
      
      return {
        text: data.answer || textResults,
        sources: sources,
        images: images
      };
    } else {
      throw new Error(`DuckDuckGo API returned status ${response.status}`);
    }
  } catch(e: any) {
    console.error("DuckDuckGo Search Failed:", e.message);
    throw new Error(`DuckDuckGo Search Failed: ${e.message}`);
  }
};

// --- Image Augmentation (Through Backend) ---
const augmentImages = async (query: string, currentImages: string[]): Promise<string[]> => {
  try {
    // Using DuckDuckGo Images API through the backend proxy
    const response = await fetch(`${getApiUrl('/api/duckduckgo/images')}?query=${encodeURIComponent(query)}&max_results=5`);
    if (response.ok) {
      const data = await response.json();
      const newImages = data.images || [];
      return [...currentImages, ...newImages];
    } else {
      console.warn(`DuckDuckGo image search failed with status: ${response.status}`);
    }
  } catch(e: any) {
    console.warn("DuckDuckGo image search failed:", e.message);
  }
  
  return currentImages;
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  let result: SearchResult = { text: "", sources: [], images: [] };
  
  // Always use backend for search operations to ensure API keys stay secure
  try {
    result = await backendSearch(query);
  } catch (e: any) {
    console.warn("Backend search failed, trying DuckDuckGo:", e?.message || String(e));
    try {
      result = await duckduckgoSearch(query);
    } catch (ddgError: any) {
      console.warn("DuckDuckGo failed:", ddgError?.message || String(ddgError));
      // Return empty result if all methods fail
      result = { text: "Search failed. Please try again later.", sources: [], images: [] };
    }
  }

  // Enhance images through backend
  result.images = await augmentImages(query, result.images);
  
  return result;
};

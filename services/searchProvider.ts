
import { config, hasKey, getApiUrl, getEnv } from "./config";
import { GoogleGenAI } from "@google/genai";
import { Source } from "../types";

interface SearchResult {
  text: string;
  sources: Source[];
  images: string[];
}

// --- 1. Gemini Grounding Implementation (Primary/Fallback) ---
// This enables "Single API Key" mode using just the Google Key.
const geminiSearch = async (query: string): Promise<SearchResult> => {
  if (!config.googleApiKey) throw new Error("No Google API Key for search");
  
  const ai = new GoogleGenAI({ apiKey: config.googleApiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a search engine. Perform a comprehensive real-time Google Search for: "${query}".
      
      1. Provide a very detailed summary of the findings, prioritizing data, statistics, and concrete facts.
      2. IMPORTANT: If you find relevant images in the search results, you MUST embed them in the text using Markdown format: ![alt text](url).
      3. Try to include at least 3 relevant images if possible.
      `,
      config: { 
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    const text = response.text || "";
    const sources: Source[] = [];
    const images: string[] = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    // Extract images from markdown
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = imgRegex.exec(text)) !== null) {
      if (match[1].startsWith('http')) {
        images.push(match[1]);
      }
    }

    return { text, sources, images };
  } catch (e) {
    console.error("Gemini Search Failed:", e);
    throw e;
  }
};

// --- 2. Tavily Implementation (Optional) ---
const tavilySearch = async (query: string): Promise<SearchResult> => {
  if (!config.tavilyApiKey) throw new Error("Tavily Key missing");

  const response = await fetch(getEnv('TAVILY_API_URL') || "https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: config.tavilyApiKey,
      query: query,
      search_depth: "advanced", 
      include_images: true,
      include_answer: true, 
      max_results: 10
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Handle specific Tavily error cases
    if (response.status === 432) {
      throw new Error("Tavily API usage limit exceeded. Falling back to Google search.");
    } else if (response.status === 401) {
      throw new Error("Tavily API key is invalid. Falling back to Google search.");
    } else if (response.status === 429) {
      throw new Error("Tavily API rate limit exceeded. Falling back to Google search.");
    }
    throw new Error(`Tavily API Error: ${response.status} - ${errorText}`);
  }
  const data = await response.json();

  let text = data.answer || "";
  if (data.results) {
    text += data.results.map((r: any) => `\nTitle: ${r.title}\nContent: ${r.content}`).join("\n");
  }

  const sources = data.results?.map((r: any) => ({ title: r.title, uri: r.url })) || [];
  const images = data.images || [];

  return { text, sources, images };
};

// --- Image Augmentation ---
const augmentImages = async (query: string, currentImages: string[]): Promise<string[]> => {
    // New fallback sequence: Google Gemini → DuckDuckGo → Pexels → Unsplash → Hugging Face
    
    // 1. First try Google Gemini for image generation
    // (Already handled in geminiSearch function)
    
    // 2. Try DuckDuckGo for image search
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
    } catch(e) {
        console.warn("DuckDuckGo image search failed:", e);
    }
    
    // 3. If we have Pexels key, use it (High limit)
    if (hasKey(config.pexelsApiKey)) {
        try {
            const res = await fetch(`${getEnv('PEXELS_API_URL') || "https://api.pexels.com/v1/search"}?query=${encodeURIComponent(query)}&per_page=5`, {
            headers: { Authorization: config.pexelsApiKey! }
            });
            if (res.ok) {
                const data = await res.json();
                const newImgs = data.photos.map((img: any) => img.src.medium);
                return [...currentImages, ...newImgs];
            }
        } catch(e) {}
    }
    
    // 4. Try Unsplash if Pexels fails or is not available
    if (hasKey(config.unsplashAccessKey)) {
        try {
            const res = await fetch(`${getEnv('UNSPLASH_API_URL') || "https://api.unsplash.com/search/photos"}?query=${encodeURIComponent(query)}&per_page=5`, {
                headers: { Authorization: `Client-ID ${config.unsplashAccessKey!}` }
            });
            if (res.ok) {
                const data = await res.json();
                const newImgs = data.results.map((img: any) => img.urls.small);
                return [...currentImages, ...newImgs];
            }
        } catch(e) {}
    }
    
    // 5. Try Hugging Face for image generation (deprioritized due to reliability issues)
    // TODO: Implement Hugging Face image generation if needed
    
    // Log the prioritization of image sources
    console.log("Image sources prioritized: Pexels/Unsplash > Hugging Face (due to reliability issues)");
    
    return currentImages;
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  let result: SearchResult = { text: "", sources: [], images: [] };
  
  // NEW: Strategy based on your request - Always try Google Gemini first
  // Fallback sequence: Google Gemini → Tavily → DuckDuckGo → Google Gemini (fallback)
  try {
    result = await geminiSearch(query);
  } catch (e: any) {
    console.warn("Gemini search failed, trying Tavily:", e?.message || String(e));
    // Only try Tavily if Gemini fails
    if (hasKey(config.tavilyApiKey)) {
      try {
        result = await tavilySearch(query);
      } catch (tavilyError: any) {
        console.warn("Tavily failed, trying DuckDuckGo:", tavilyError?.message || String(tavilyError));
        // Try DuckDuckGo as an additional fallback
        try {
          console.log(`Falling back to DuckDuckGo for query: ${query}`);
          const response = await fetch(`${getApiUrl('/api/duckduckgo/search')}?query=${encodeURIComponent(query)}&max_results=10`);
          if (response.ok) {
            const data = await response.json();
            
            // Format the response to match SearchResult interface
            const textResults = data.results?.map((r: any) => `\nTitle: ${r.title}\nContent: ${r.content}`).join('') || '';
            const sources = data.results?.map((r: any) => ({ title: r.title, uri: r.url })) || [];
            const images = data.images || [];
            
            result = {
              text: data.answer || textResults,
              sources: sources,
              images: images
            };
          } else {
            throw new Error(`DuckDuckGo API returned status ${response.status}`);
          }
        } catch (ddgError: any) {
          console.warn("DuckDuckGo failed, falling back to Gemini:", ddgError?.message || String(ddgError));
          // Final fallback to Gemini even if it failed before (might work on second try)
          result = await geminiSearch(query);
        }
      }
    } else {
      // If no Tavily key, try DuckDuckGo then fall back to Gemini
      try {
        console.log(`Falling back to DuckDuckGo for query: ${query}`);
        const response = await fetch(`${getApiUrl('/api/duckduckgo/search')}?query=${encodeURIComponent(query)}&max_results=10`);
        if (response.ok) {
          const data = await response.json();
          
          // Format the response to match SearchResult interface
          const textResults = data.results?.map((r: any) => `\nTitle: ${r.title}\nContent: ${r.content}`).join('') || '';
          const sources = data.results?.map((r: any) => ({ title: r.title, uri: r.url })) || [];
          const images = data.images || [];
          
          result = {
            text: data.answer || textResults,
            sources: sources,
            images: images
          };
        } else {
          throw new Error(`DuckDuckGo API returned status ${response.status}`);
        }
      } catch (ddgError: any) {
        console.warn("DuckDuckGo failed, falling back to Gemini:", ddgError?.message || String(ddgError));
        result = await geminiSearch(query);
      }
    }
  }

  // Enhance images if possible using the new fallback sequence
  result.images = await augmentImages(query, result.images);
  
  return result;
};

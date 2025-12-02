
import { GoogleGenAI } from "@google/genai";
import { config, hasKey, logConfigStatus } from "./config";

// Initialize logging once
logConfigStatus();

// --- Types ---
interface GenerationParams {
  prompt: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  thinkingBudget?: number;
}

interface LLMProvider {
  generate(params: GenerationParams): Promise<string>;
  generateStream(params: GenerationParams): AsyncGenerator<string, void, unknown>;
}

// --- 1. Hugging Face Implementation (Fallback) ---
class HuggingFaceProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(params: GenerationParams): Promise<string> {
    const fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${params.systemInstruction || "You are a helpful assistant."}${params.jsonMode ? " Output strict JSON only." : ""}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${params.prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 4096, // Increased for report generation
            return_full_text: false,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
          throw new Error(`HuggingFace API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      let text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
      return text || "";
    } catch (error) {
      console.error("HuggingFace Generation Failed:", error);
      throw error;
    }
  }

  async *generateStream(params: GenerationParams): AsyncGenerator<string, void, unknown> {
    const fullText = await this.generate(params);
    const chunkSize = 50;
    for (let i = 0; i < fullText.length; i += chunkSize) {
      yield fullText.slice(i, i + chunkSize);
      await new Promise(r => setTimeout(r, 10)); 
    }
  }
}

// --- 2. Groq Implementation (Optional High Speed) ---
class GroqProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1/chat/completions";
  private model = "llama-3.3-70b-versatile"; 

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(params: GenerationParams): Promise<string> {
    const messages = [
      { role: "system", content: params.systemInstruction || "You are a helpful research assistant." },
      { role: "user", content: params.prompt }
    ];

    if (params.jsonMode) {
      messages[0] = { ...messages[0], content: messages[0].content + " You must output valid JSON only." };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.5,
          response_format: params.jsonMode ? { type: "json_object" } : undefined
        })
      });

      if (!response.ok) {
         const err = await response.text();
         throw new Error(`Groq API Error (${response.status}): ${err}`);
      }
      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Groq Generation Failed:", error);
      throw error;
    }
  }

  async *generateStream(params: GenerationParams): AsyncGenerator<string, void, unknown> {
    // Basic implementation for compatibility, though we prefer Gemini for streaming reports
    const text = await this.generate(params);
    yield text;
  }
}

// --- 3. Google Gemini Implementation (PRIMARY) ---
class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI;
  private model = "gemini-2.5-flash";

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(params: GenerationParams): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.jsonMode ? "application/json" : "text/plain",
          thinkingConfig: params.thinkingBudget ? { thinkingBudget: params.thinkingBudget } : undefined
        }
      });
      return response.text || "";
    } catch (e: any) {
      console.error("Gemini Error:", e);
      throw e;
    }
  }

  async *generateStream(params: GenerationParams): AsyncGenerator<string, void, unknown> {
    try {
      const result = await this.ai.models.generateContentStream({
        model: this.model,
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          thinkingConfig: params.thinkingBudget ? { thinkingBudget: params.thinkingBudget } : undefined
        }
      });

      for await (const chunk of result) {
        if (chunk.text) yield chunk.text;
      }
    } catch (e) {
      console.error("Gemini Stream Error:", e);
      throw e;
    }
  }
}

// --- Main Factory: Prioritizes Gemini for Single-Key Operation ---
export const getLLMProvider = (): LLMProvider => {
  // 1. Google Gemini (Primary for everything)
  if (hasKey(config.googleApiKey)) {
    return new GeminiProvider(config.googleApiKey!);
  }
  
  // 2. Groq (Secondary)
  if (hasKey(config.groqApiKey)) {
    return new GroqProvider(config.groqApiKey!);
  }

  // 3. Hugging Face (Fallback)
  if (hasKey(config.huggingFaceApiKey)) {
    return new HuggingFaceProvider(config.huggingFaceApiKey!);
  }
  
  throw new Error("Missing API Key. Please add GOOGLE_API_KEY to your .env file.");
};

// --- Report Factory (Strict Priority: Gemini -> HF) ---
export const getReportLLM = (): LLMProvider => {
  return getLLMProvider(); // Reuse the same priority logic for simplicity and single-key compliance
};

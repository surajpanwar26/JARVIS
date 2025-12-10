import { GoogleGenAI } from "@google/genai";
import { config, hasKey, logConfigStatus, getApiUrl, getEnv } from "./config";

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

// --- 1. Backend Implementation (All API Keys Stay in Backend) ---
class BackendProvider implements LLMProvider {
  async generate(params: GenerationParams): Promise<string> {
    try {
      // Instead of making direct calls to external APIs, use our backend endpoint
      const response = await fetch(getApiUrl('/api/llm/generate'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: params.prompt,
          system_instruction: params.systemInstruction,
          json_mode: params.jsonMode,
          thinking_budget: params.thinkingBudget
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // Check if this is a quota limit error
        if (response.status === 429 || errorText.toLowerCase().includes('quota') || errorText.toLowerCase().includes('limit')) {
          throw new Error(`API Limit Reached: ${errorText}`);
        }
        throw new Error(`Backend LLM API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.content || "";
    } catch (e: any) {
      console.error("Backend Generation Failed:", e.message);
      // Check if this is a quota limit error
      if (e.message.includes('API Limit Reached') || e.message.includes('quota') || e.message.includes('limit')) {
        throw new Error(`API Limit Reached. Please wait for quota reset.`);
      }
      throw new Error(`Backend Generation Failed: ${e.message}`);
    }
  }

  async *generateStream(params: GenerationParams): AsyncGenerator<string, void, unknown> {
    // For streaming, we'll just return the full content since our backend doesn't support streaming yet
    const text = await this.generate(params);
    yield text;
  }
}

// --- Main Factory: Always use backend for security ---
export const getLLMProvider = (): LLMProvider => {
  // Always use backend provider to ensure API keys stay secure
  console.log("Using Provider: Backend (Secure)");
  return new BackendProvider();
};

// --- Report Factory ---
export const getReportLLM = (): LLMProvider => {
  return getLLMProvider(); 
};

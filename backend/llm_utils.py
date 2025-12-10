import os
import requests
import logging
from requests.exceptions import Timeout

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def generate_llm_content(prompt: str, system_instruction: str = "", is_report: bool = False):
    """Generate content using LLM with fallback providers"""
    logger.info("Generating LLM content with fallback support")
    
    # Try providers in order of preference (Google Gemini -> Groq -> Hugging Face)
    # Hugging Face deprioritized due to reliability issues
    providers = []
    
    # 1. Google Gemini (primary) - Re-enabled for better accuracy
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if google_api_key:
        providers.append({
            "name": "Google Gemini",
            "url": f"{os.getenv('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent')}?key={google_api_key}",
            "payload": {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096 if is_report else 2048
                }
            },
            "headers": {"Content-Type": "application/json"}
        })
        
        if system_instruction:
            providers[-1]["payload"]["systemInstruction"] = {"parts": [{"text": system_instruction}]}
    
    # 2. Groq (first fallback)
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        providers.append({
            "name": "Groq",
            "url": os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions"),
            "payload": {
                "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
                "messages": [
                    {"role": "system", "content": system_instruction or "You are a helpful research assistant."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 1024 if not is_report else 2048  # Reduce tokens for non-report generation
            },
            "headers": {
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            }
        })
    
    # 3. Hugging Face (deprioritized fallback)
    hugging_face_api_key = os.getenv("HUGGINGFACE_API_KEY")
    if hugging_face_api_key:
        # List of Hugging Face models to try in order of preference
        huggingface_models = os.getenv("HUGGINGFACE_MODELS", "google/gemma-2-9b-it,microsoft/Phi-3-mini-4k-instruct,mistralai/Mistral-7B-Instruct-v0.3,HuggingFaceH4/zephyr-7b-beta,TinyLlama/TinyLlama-1.1B-Chat-v1.0").split(",")
        
        # Try each model in order until one works
        for model_id in huggingface_models:
            providers.append({
                "name": f"Hugging Face ({model_id})",
                "url": f"{os.getenv('HUGGINGFACE_API_URL', 'https://router.huggingface.co/models')}/{model_id}",
                "payload": {
                    "inputs": f"{system_instruction or 'You are a helpful assistant.'}\n\n{prompt}",
                    "parameters": {
                        "max_new_tokens": 500 if not is_report else 1000,  # Reduce tokens for non-report generation
                        "return_full_text": False,
                        "temperature": 0.7
                    }
                },
                "headers": {
                    "Authorization": f"Bearer {hugging_face_api_key}",
                    "Content-Type": "application/json"
                }
            })
    if not providers:
        raise Exception("No API keys configured for LLM providers")
    
    # Try each provider in order
    last_error = None
    for provider in providers:
        try:
            logger.info(f"Trying LLM provider: {provider['name']}")
            # Add timeout to prevent hanging requests
            response = requests.post(
                provider["url"],
                json=provider["payload"],
                headers=provider["headers"],
                timeout=30  # 30 second timeout
            )
            response.raise_for_status()
            
            # Parse response based on provider
            if provider["name"] == "Google Gemini":
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
            elif provider["name"] == "Hugging Face":
                result = response.json()
                content = result[0]["generated_text"] if isinstance(result, list) else result.get("generated_text", "")
            elif provider["name"] == "Groq":
                result = response.json()
                content = result["choices"][0]["message"]["content"]
            else:
                content = response.text
            
            logger.info(f"Successfully generated content using {provider['name']}")
            return {"content": content, "provider": provider["name"]}
            
        except Timeout:
            last_error = Timeout("Request timed out")
            logger.warning(f"{provider['name']} request timed out")
            continue
        except Exception as e:
            last_error = e
            # Check if this is a quota limit error
            error_str = str(e).lower()
            is_quota_error = "429" in error_str or "quota" in error_str or "limit" in error_str or "exceeded" in error_str
            
            if is_quota_error:
                logger.warning(f"{provider['name']} quota limit hit: {str(e)}")
            else:
                logger.warning(f"Failed to generate content with {provider['name']}: {str(e)}")
            
            # If it's not a quota error, we might want to continue to the next provider
            # If it is a quota error, we still continue to the next provider as per fallback strategy
            continue
    
    # If we get here, all providers failed - return a simple fallback response
    logger.warning(f"All LLM providers failed. Last error: {str(last_error)}. Returning fallback response.")
    fallback_content = f"I apologize, but I'm unable to generate a detailed response at the moment due to API limitations. Here's a brief overview based on general knowledge:\n\n{prompt}\n\nThis is a fallback response because all AI providers are currently unavailable."
    return {"content": fallback_content, "provider": "Fallback"}
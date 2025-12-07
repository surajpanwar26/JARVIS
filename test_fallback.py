import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_llm_fallback():
    """Test the LLM fallback mechanism"""
    print("Testing LLM fallback mechanism...")
    
    # Test payload
    payload = {
        "prompt": "Generate a brief summary about artificial intelligence.",
        "system_instruction": "You are a helpful research assistant.",
        "json_mode": False,
        "thinking_budget": None
    }
    
    # Make request to the backend LLM endpoint
    try:
        response = requests.post(
            "http://localhost:8000/api/llm/generate",
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Generated content using: {result.get('provider', 'Unknown')}")
            print(f"Content preview: {result['content'][:100]}...")
            return True
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

if __name__ == "__main__":
    test_llm_fallback()
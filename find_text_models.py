import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def find_text_generation_models():
    """Find text generation models on Hugging Face"""
    hf_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not hf_key:
        print("❌ Hugging Face API key not found")
        return
    
    # Search for different types of models
    searches = ['gemma', 'llama', 'mistral', 'phi']
    
    for search_term in searches:
        print(f"\nSearching for '{search_term}' models...")
        try:
            headers = {'Authorization': f'Bearer {hf_key}'}
            response = requests.get(f'https://huggingface.co/api/models?search={search_term}&limit=3', headers=headers)
            
            if response.status_code == 200:
                models = response.json()
                print(f'  ✅ Found {len(models)} models')
                for model in models:
                    model_id = model.get("id", "Unknown")
                    print(f'    - {model_id}')
            else:
                print(f'  ❌ Failed: {response.status_code}')
        except Exception as e:
            print(f'  ❌ Error: {str(e)}')

def test_model_accessibility(model_id):
    """Test if a specific model is accessible through router endpoint"""
    hf_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not hf_key:
        return False
    
    try:
        headers = {
            'Authorization': f'Bearer {hf_key}',
            'Content-Type': 'application/json'
        }
        payload = {
            "inputs": "Say hello",
            "parameters": {
                "max_new_tokens": 50,
                "return_full_text": False
            }
        }
        
        router_url = f"https://router.huggingface.co/models/{model_id}"
        response = requests.post(router_url, json=payload, headers=headers, timeout=10)
        
        print(f"  {model_id}: {'✅ PASS' if response.ok else f'❌ FAIL ({response.status_code})'}")
        return response.ok
    except Exception as e:
        print(f"  {model_id}: ❌ ERROR ({str(e)[:50]})")
        return False

if __name__ == "__main__":
    print("Finding Text Generation Models on Hugging Face")
    print("=" * 50)
    
    find_text_generation_models()
    
    # Test a few specific models for accessibility
    print("\n" + "=" * 50)
    print("Testing model accessibility...")
    
    test_models = [
        "google/gemma-2-9b-it",
        "meta-llama/Meta-Llama-3-8B-Instruct",
        "mistralai/Mistral-7B-Instruct-v0.3"
    ]
    
    for model in test_models:
        test_model_accessibility(model)
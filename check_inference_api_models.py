import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def check_inference_api_compatible_models():
    """Check for models that are specifically compatible with the inference API"""
    print("Checking for Inference API Compatible Models...")
    
    import requests
    huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    if not huggingface_api_key:
        print("❌ Hugging Face API key not found")
        return []
    
    try:
        headers = {
            "Authorization": f"Bearer {huggingface_api_key}"
        }
        
        # Search for models tagged as inference API compatible
        search_url = "https://huggingface.co/api/models"
        params = {
            "search": "inference",
            "limit": 20
        }
        
        response = requests.get(search_url, headers=headers, params=params, timeout=30)
        
        if response.status_code == 200:
            models = response.json()
            print(f"✅ Found {len(models)} models with 'inference' in their metadata")
            
            inference_compatible = []
            for model in models:
                model_id = model.get('id', model.get('modelId', ''))
                tags = model.get('tags', [])
                
                # Check if model is specifically marked as inference API compatible
                if 'endpoints_compatible' in tags or 'inference_api' in tags:
                    inference_compatible.append(model_id)
                    print(f"   🎯 {model_id} - Inference API Compatible")
                    
            return inference_compatible
        else:
            print(f"❌ Failed to search models: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error searching models: {str(e)}")
        return []

def test_direct_inference_endpoint(model_id):
    """Test a model using the direct inference endpoint"""
    print(f"\n   Testing direct inference endpoint for {model_id}...")
    
    import requests
    huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    if not huggingface_api_key:
        print("❌ Hugging Face API key not found")
        return False
    
    # Try direct inference endpoint
    inference_url = f"https://api-inference.huggingface.co/models/{model_id}"
    
    try:
        headers = {
            "Authorization": f"Bearer {huggingface_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "inputs": "Write a short summary about artificial intelligence.",
            "parameters": {
                "max_new_tokens": 100,
                "temperature": 0.7
            }
        }
        
        response = requests.post(inference_url, json=payload, headers=headers, timeout=30)
        
        if response.ok:
            result = response.json()
            content = result[0]["generated_text"] if isinstance(result, list) else result.get("generated_text", "")
            word_count = len(content.split())
            print(f"   ✅ Success! Generated {word_count} words")
            print(f"   Content preview: {content[:100]}...")
            return True
        else:
            print(f"   ❌ Failed: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:100]}...")
        return False

def check_popular_models():
    """Check some popular models that are known to work with inference API"""
    print("\nChecking Popular Models Known to Work with Inference API...")
    
    popular_models = [
        "gpt2",
        "distilgpt2",
        "bert-base-uncased",
        "distilbert-base-uncased"
    ]
    
    working_models = []
    
    for model_id in popular_models:
        print(f"\n   Testing {model_id}...")
        
        import requests
        huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
        
        if not huggingface_api_key:
            print("❌ Hugging Face API key not found")
            continue
        
        # Try direct inference endpoint
        inference_url = f"https://api-inference.huggingface.co/models/{model_id}"
        
        try:
            headers = {
                "Authorization": f"Bearer {huggingface_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "inputs": "The capital of France is"
            }
            
            response = requests.post(inference_url, json=payload, headers=headers, timeout=30)
            
            if response.ok:
                result = response.json()
                print(f"   ✅ Success! Model is accessible")
                working_models.append(model_id)
            else:
                print(f"   ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:50]}...")
    
    return working_models

if __name__ == "__main__":
    print("Checking Hugging Face Inference API Compatibility")
    print("=" * 60)
    
    # Check for inference API compatible models
    compatible_models = check_inference_api_compatible_models()
    
    print("\n" + "=" * 60)
    
    # Test some popular models
    working_models = check_popular_models()
    
    print("\n" + "=" * 60)
    print("FINAL RESULTS:")
    print("")
    
    if compatible_models:
        print("🎯 Inference API Compatible Models Found:")
        for model in compatible_models:
            print(f"   - {model}")
    else:
        print("❌ No specifically compatible models found in search")
    
    if working_models:
        print("\n✅ Working Popular Models:")
        for model in working_models:
            print(f"   - {model}")
        print("\n🎉 Some models are accessible through the inference API!")
    else:
        print("\n😔 No popular models are accessible through the inference API.")
    
    print("\n💡 Note: Even if models are not accessible through the inference API,")
    print("   they might still be available through specialized endpoints or platforms.")
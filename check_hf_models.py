import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def check_available_models():
    """Check what Hugging Face models are available with the API key"""
    print("Checking available Hugging Face models...")
    
    import requests
    huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    if not huggingface_api_key:
        print("❌ Hugging Face API key not found")
        return []
    
    try:
        headers = {
            "Authorization": f"Bearer {huggingface_api_key}"
        }
        
        # Get list of models
        response = requests.get('https://huggingface.co/api/models', headers=headers)
        
        if response.status_code == 200:
            models = response.json()
            print(f"✅ Found {len(models)} models")
            
            # Filter for instruct models
            instruct_models = []
            for model in models:
                model_id = model.get('id', model.get('modelId', ''))
                if 'instruct' in model_id.lower():
                    instruct_models.append(model_id)
            
            print(f"✅ Found {len(instruct_models)} instruct models")
            
            # Show first 15 instruct models
            print("\nFirst 15 instruct models:")
            for i, model_id in enumerate(instruct_models[:15]):
                print(f"  {i+1}. {model_id}")
            
            return instruct_models
        else:
            print(f"❌ Failed to get models: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error checking models: {str(e)}")
        return []

def test_top_models_for_reports(instruct_models):
    """Test the top models for report generation"""
    print("\n" + "=" * 60)
    print("Testing top instruct models for report generation...")
    
    import requests
    huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    if not huggingface_api_key or not instruct_models:
        print("❌ No API key or models to test")
        return []
    
    # Test first 5 models
    models_to_test = instruct_models[:5]
    results = []
    
    prompt = "Create a very brief report (under 150 words) on artificial intelligence. Include: 1. A short summary 2. 2-3 key points 3. 1-2 insights."
    
    for model_id in models_to_test:
        print(f"\n   Testing {model_id}...")
        
        # Try router endpoint first
        model_url = f"https://router.huggingface.co/models/{model_id}"
        
        try:
            headers = {
                "Authorization": f"Bearer {huggingface_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 250,
                    "temperature": 0.7
                }
            }
            
            response = requests.post(model_url, json=payload, headers=headers, timeout=30)
            
            if response.ok:
                result = response.json()
                content = result[0]["generated_text"] if isinstance(result, list) else result.get("generated_text", "")
                word_count = len(content.split())
                print(f"   ✅ Success! Generated {word_count} words")
                results.append({
                    "model": model_id,
                    "status": "success",
                    "word_count": word_count,
                    "content_length": len(content)
                })
            else:
                print(f"   ❌ Failed: {response.status_code}")
                results.append({
                    "model": model_id,
                    "status": "failed",
                    "error": response.status_code
                })
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:50]}...")
            results.append({
                "model": model_id,
                "status": "error",
                "error": str(e)[:50]
            })
    
    return results

if __name__ == "__main__":
    print("Checking Hugging Face Models for Report Generation")
    print("=" * 60)
    
    # Check available models
    instruct_models = check_available_models()
    
    if instruct_models:
        # Test top models
        results = test_top_models_for_reports(instruct_models)
        
        print("\n" + "=" * 60)
        print("TEST RESULTS:")
        print("")
        
        success_count = 0
        for result in results:
            status = "✅ PASS" if result["status"] == "success" else "❌ FAIL"
            if result["status"] == "success":
                print(f"  {result['model']}: {status} ({result['word_count']} words)")
                success_count += 1
            else:
                print(f"  {result['model']}: {status}")
        
        print(f"\n✅ {success_count} out of {len(results)} models working")
        
        if success_count > 0:
            print("\n🎉 Found working Hugging Face models!")
            # Find the best model based on word count
            working_models = [r for r in results if r["status"] == "success"]
            if working_models:
                best = max(working_models, key=lambda x: x["word_count"])
                print(f"\n🏆 Best model for reports: {best['model']} ({best['word_count']} words)")
        else:
            print("\n😔 No Hugging Face models are currently accessible.")
            print("   Our fallback to Groq will continue to work reliably.")
    else:
        print("\n❌ Could not retrieve model list")
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_available_models():
    """Check what models are available through Hugging Face API"""
    hf_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not hf_key:
        print("❌ Hugging Face API key not found")
        return
    
    try:
        headers = {'Authorization': f'Bearer {hf_key}'}
        response = requests.get('https://huggingface.co/api/models?limit=10&full=false', headers=headers)
        
        print('Status:', response.status_code)
        
        if response.status_code == 200:
            models = response.json()
            print(f'✅ Found {len(models)} models')
            print('Sample models:')
            for i, model in enumerate(models[:5]):
                print(f'  {i+1}. {model.get("id", "Unknown")}')
        else:
            print(f'❌ Failed to get models: {response.status_code}')
            print(response.text[:200])
    except Exception as e:
        print(f'❌ Error: {str(e)}')

if __name__ == "__main__":
    check_available_models()
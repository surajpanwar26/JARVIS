import requests

def test_new_tavily_api_key():
    """
    Test if the new Tavily API key is working
    """
    api_key = "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"
    
    print(f"Testing new Tavily API key: {api_key[:15]}...")
    
    # Test URL for Tavily API
    url = "https://api.tavily.com/search"
    
    # Simple test payload
    payload = {
        "api_key": api_key,
        "query": "What is the capital of Germany?",
        "search_depth": "basic",
        "include_answer": True,
        "max_results": 3
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("Sending test request to Tavily API...")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: New Tavily API key is working!")
            result = response.json()
            if "answer" in result:
                print(f"Answer: {result['answer']}")
            return True
        elif response.status_code == 401:
            print("❌ UNAUTHORIZED: API key might be invalid")
            print(f"Error details: {response.text}")
            return False
        elif response.status_code == 429:
            print("❌ RATE LIMIT: Too many requests")
            print(f"Error details: {response.text}")
            return False
        elif response.status_code == 432:
            print("❌ USAGE LIMIT EXCEEDED: API key usage limit has been hit")
            print(f"Error details: {response.text}")
            return False
        else:
            print(f"❌ UNEXPECTED ERROR: Status code {response.status_code}")
            print(f"Error details: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request timed out")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Could not connect to the API")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    print("New Tavily API Key Test")
    print("=" * 25)
    test_new_tavily_api_key()
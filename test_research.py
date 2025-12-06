import requests
import json

import os

# Test the research endpoint
# Use environment variable for API URL with fallback to localhost
default_url = "http://localhost:8002"
api_url = os.environ.get('API_URL', default_url)
url = f"{api_url}/api/research"
payload = {
    "topic": "artificial intelligence",
    "is_deep": False
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {str(e)}")
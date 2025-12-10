import sys
import os

# Add current directory to Python path
sys.path.insert(0, '.')

# Set the PORT environment variable if not already set
os.environ.setdefault('PORT', '8002')

# Import and run the server
import uvicorn
from backend.server import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
"""
DuckDuckGo Search Provider for the JARVIS Research System
"""
import os
import logging
from typing import Dict, List, Any
from ddgs import DDGS

logger = logging.getLogger(__name__)

def perform_duckduckgo_search(query: str) -> Dict[str, Any]:
    """
    Perform search using DuckDuckGo
    
    Args:
        query (str): Search query
        
    Returns:
        Dict containing search results in the same format as other providers
    """
    try:
        logger.info(f"Performing DuckDuckGo search for: {query}")
        
        # Use DDGS as context manager
        with DDGS() as ddgs:
            # Perform text search
            text_results = list(ddgs.text(query, max_results=10))
            
            # Perform image search
            image_results = list(ddgs.images(query, max_results=5))
        
        # Format results to match Tavily format
        formatted_results = []
        for result in text_results:
            formatted_results.append({
                "title": result.get("title", "Untitled"),
                "content": result.get("body", ""),
                "url": result.get("href", "#")
            })
        
        # Extract image URLs
        images = [img.get("image", "") for img in image_results if img.get("image")]
        
        # Create a summary from the top results
        summary = "\n\n".join([
            f"Title: {result['title']}\nContent: {result['content']}" 
            for result in formatted_results[:3]  # Top 3 results for summary
        ])
        
        return {
            "answer": summary,
            "results": formatted_results,
            "images": images
        }
        
    except Exception as e:
        logger.error(f"DuckDuckGo search failed: {str(e)}")
        raise Exception(f"DuckDuckGo search failed: {str(e)}")

def test_duckduckgo_search():
    """Test function to verify DuckDuckGo search is working"""
    try:
        result = perform_duckduckgo_search("artificial intelligence")
        print("DuckDuckGo Search Test Results:")
        print(f"Answer: {result['answer'][:200]}...")
        print(f"Number of results: {len(result['results'])}")
        print(f"Number of images: {len(result['images'])}")
        return True
    except Exception as e:
        print(f"Error testing DuckDuckGo search: {e}")
        return False

if __name__ == "__main__":
    test_duckduckgo_search()
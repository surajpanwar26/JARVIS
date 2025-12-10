from typing import Dict, List, Any
from backend.agents.base_agent import BaseAgent
from backend.utils import logger

class ImageAgent(BaseAgent):
    """Agent responsible for extracting and processing visual assets"""
    
    def __init__(self):
        super().__init__("Image")
    
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Extract images from research results"""
        logger.info(f"[{self.name}] Extracting visual assets")
        
        # Extract images from the search results
        search_results = state.get("search_results", {})
        # Preserve existing images collected by ResearcherAgent
        images = state.get("images", [])
        
        # Get images from Tavily search results and add to existing images
        if "images" in search_results:
            tavily_images = search_results["images"]
            # Add Tavily images that aren't already in our collection
            for img in tavily_images:
                if img not in images:
                    images.append(img)
        
        logger.info(f"[{self.name}] Extracted {len(images)} images")
        
        # Update state
        state["images"] = images
        
        return state
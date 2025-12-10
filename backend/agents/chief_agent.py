from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.agents.researcher_agent import ResearcherAgent
from backend.agents.image_agent import ImageAgent
from backend.agents.source_agent import SourceAgent
from backend.agents.report_agent import ReportAgent
from backend.agents.ai_assistant_agent import AIAssistantAgent
from backend.agents.document_analyzer_agent import DocumentAnalyzerAgent
from backend.agents.local_document_analyzer import LocalDocumentAnalyzerAgent
from backend.utils import logger

class ChiefAgent(BaseAgent):
    """Chief agent that orchestrates all other agents"""
    
    def __init__(self):
        super().__init__("Chief")
        self.researcher = ResearcherAgent()
        self.image_agent = ImageAgent()
        self.source_agent = SourceAgent()
        self.report_agent = ReportAgent()
        self.ai_assistant = AIAssistantAgent()
        self.document_analyzer = DocumentAnalyzerAgent()
        self.local_document_analyzer = LocalDocumentAnalyzerAgent()
    
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate the research workflow"""
        logger.info(f"[{self.name}] Starting research workflow")
        
        try:
            # Check if this is an AI Chatbot request
            if state.get("question"):
                # For AI Chatbot, we only need the AI Assistant agent
                logger.info(f"[{self.name}] Processing AI Chatbot request")
                state = await self.ai_assistant.execute(state)
            # Check if this is a document analysis request
            elif state.get("file_base64"):
                # For document analysis, try API-based first, then Groq, then local
                logger.info(f"[{self.name}] Processing document analysis request")
                try:
                    # First try: Google Gemini
                    state = await self.document_analyzer.execute(state)
                except Exception as gemini_error:
                    logger.warning(f"[{self.name}] Google Gemini document analysis failed: {str(gemini_error)}")
                    try:
                        # Second try: Groq
                        logger.info(f"[{self.name}] Falling back to Groq for document analysis")
                        from ..llm_utils import generate_llm_content
                        
                        file_base64 = state.get("file_base64", "")
                        mime_type = state.get("mime_type", "text/plain")
                        
                        prompt = f"""Analyze this document (MIME type: {mime_type}) and provide a comprehensive, meaningful summary of its contents. 
                        Focus on the key points, main ideas, and important details.
                        Structure your response with these sections:
                        1. EXECUTIVE SUMMARY: A clear overview of what the document is about
                        2. KEY TOPICS COVERED: The main subjects discussed
                        3. MAIN ARGUMENTS/POINTS: Core ideas or positions presented
                        4. SIGNIFICANT DETAILS: Important facts, figures, or examples
                        5. CONCLUSION: Overall takeaway from the document
                        
                        Provide a detailed, accessible explanation without technical jargon."""
                        
                        system_instruction = "You are a professional document analyst. Provide a thorough, insightful analysis of the document content."
                        
                        result = generate_llm_content(
                            prompt=prompt,
                            system_instruction=system_instruction
                        )
                        
                        # Update state with Groq results
                        state["report"] = result.get("content", "Document analysis completed with Groq.")
                        state["sources"] = [{"title": "Uploaded Document", "uri": "#local-file"}]
                        state["images"] = []
                        
                    except Exception as groq_error:
                        logger.warning(f"[{self.name}] Groq document analysis failed, falling back to local analysis: {str(groq_error)}")
                        # Third try: Local document analyzer
                        state = await self.local_document_analyzer.execute(state)
            else:
                # For research requests, execute the full workflow
                logger.info(f"[{self.name}] Processing research request")
                
                # 1. Researcher Agent - Gather information
                state = await self.researcher.execute(state)
                
                # 2. Image Agent - Extract visual assets
                state = await self.image_agent.execute(state)
                
                # 3. Source Agent - Process sources
                state = await self.source_agent.execute(state)
                
                # 4. Report Agent - Generate report
                state = await self.report_agent.execute(state)
            
            logger.info(f"[{self.name}] Workflow completed successfully")
            return state
            
        except Exception as e:
            logger.error(f"[{self.name}] Workflow failed: {str(e)}")
            raise e
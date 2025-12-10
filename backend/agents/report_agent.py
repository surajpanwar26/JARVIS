import requests
import os
from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.utils import logger
from requests.exceptions import Timeout
from backend.llm_utils import generate_llm_content


class ReportAgent(BaseAgent):
    """Agent responsible for generating reports using LLM with fallback support"""
    
    def __init__(self):
        super().__init__("Report")
    
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate report using LLM with fallback support"""
        topic = state.get("topic", "")
        is_deep = state.get("is_deep", False)
        context = state.get("context", "")
        
        logger.info(f"[{self.name}] Generating {'deep' if is_deep else 'quick'} report on: {topic}")
        
        # Generate report using backend LLM endpoint (which has fallback chain)
        report_content = self._generate_report_with_llm(topic, context, is_deep)
        
        logger.info(f"[{self.name}] Report generation completed")
        
        # Update state
        state["report"] = report_content
        
        return state
    
    def _generate_report_with_llm(self, topic: str, context: str, is_deep: bool) -> str:
        """Generate report using backend LLM endpoint with fallback support"""
        if is_deep:
            prompt = f"""You are a professional research analyst and report writer tasked with creating a comprehensive, well-structured report on "{topic}".
            
Use the following context information to create a detailed report with the following structure:

# Executive Summary
Provide a comprehensive executive summary with 5-6 detailed paragraphs that thoroughly capture the essence of the topic, key insights, main conclusions, and critical dimensions. Each paragraph should focus on a different aspect or perspective of the topic to ensure comprehensive coverage.

# Introduction
Provide background information and context about the topic, explaining its significance and relevance.

# Detailed Analysis
Create 4-5 main sections with detailed analysis. Each section should have:
- Clear heading
- Comprehensive explanation with supporting details
- Relevant data, statistics, or examples where available
- Critical evaluation of different perspectives

# Key Findings
Present 8-10 key findings as bullet points with brief explanations.

# Implications and Applications
Discuss the practical implications, potential applications, and real-world impact of the findings.

# Challenges and Limitations
Identify major challenges, limitations, or areas of concern related to the topic.

# Future Outlook
Provide insights on future trends, developments, or directions in this field.

# Conclusions and Recommendations
Summarize the main conclusions and provide 5-6 actionable recommendations.

Context Information:
{context}

Ensure the report is comprehensive (2500+ words), well-organized, and professionally formatted using proper Markdown syntax with appropriate headings, subheadings, and lists. Focus on depth and quality rather than brevity. Pay special attention to creating a thorough executive summary with 5-6 substantive paragraphs."""
        else:
            prompt = f"""You are a professional research analyst tasked with creating a comprehensive overview report on "{topic}".
            
Use the following context information to create a detailed report with the following structure:

# Executive Summary
Provide a comprehensive executive summary with 3-5 detailed paragraphs that thoroughly capture the key points, main insights, and critical aspects of the topic. Each paragraph should focus on a different dimension or perspective of the topic.

# Key Aspects
Create 2-3 main sections covering the most important aspects of the topic, with clear headings and detailed explanations.

# Analysis and Insights
Provide critical analysis with supporting evidence, examples, and relevant data where available.

# Key Findings
Present 5-7 key findings as bullet points with brief explanations.

# Implications
Discuss the significance and potential implications of the findings.

# Conclusions and Recommendations
Summarize the main conclusions and provide 3-4 actionable recommendations.

Context Information:
{context}

Ensure the report is well-organized and professionally formatted using proper Markdown syntax with appropriate headings and lists. Create a comprehensive report that provides substantial insights while remaining focused. Aim for approximately 1500-2000 words total with particular emphasis on a detailed executive summary."""
        
        try:
            result = generate_llm_content(
                prompt=prompt,
                system_instruction="You are a research analyst skilled at creating well-structured, concise reports optimized for display in a UI. Focus only on information that will be shown to the user.",
                is_report=True
            )
            return result.get("content", "")
        except Timeout:
            logger.error(f"[{self.name}] LLM generation timed out")
            raise Exception("Report generation timed out. Please try again later.")
        except Exception as e:
            logger.error(f"[{self.name}] LLM generation failed: {str(e)}")
            raise Exception(f"Report generation failed: {str(e)}")
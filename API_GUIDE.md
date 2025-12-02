# JARVIS API Configuration Guide

This document explains how to configure the `.env` file to ensure the JARVIS Research System runs perfectly without modifying any code.

## 🏆 Recommended: The "High Limit" Free Stack

If you want the maximum number of free requests per day, use this combination:

1.  **Logic & Writing**: `GOOGLE_API_KEY` (Gemini 2.5 Flash).
    *   *Limit*: 1,500 requests/day.
    *   *Context*: 1 Million Tokens.
2.  **Search**: **Remove** `TAVILY_API_KEY` from .env.
    *   *Effect*: The app will fallback to Google's Native Search tool (1,500/day).
    *   *Comparison*: Tavily Free is only 1,000/month. Google is ~45,000/month.
3.  **Images**: `PEXELS_API_KEY`.
    *   *Limit*: 200 requests/hour.
    *   *Comparison*: Unsplash is only 50/hour.

---

## 1. Quick Setup
Copy the content below into a file named `.env` in the root directory.

```env
# --- 1. PRIMARY INTELLIGENCE (REQUIRED) ---
# Used for: Fast logic, Planning, and Reasoning.
# Model Used: llama3-70b-8192
GROQ_API_KEY=

# --- 2. REPORT GENERATION & VISION (HIGHLY RECOMMENDED) ---
# Used for: Writing long reports (1M context), analyzing PDFs, and fallback search.
# Model Used: gemini-2.5-flash
GOOGLE_API_KEY=

# --- 3. WEB SEARCH (OPTIONAL) ---
# Used for: Real-time internet scraping.
# Recommendation: Keep empty to use Google Native Search (Higher Limits)
TAVILY_API_KEY=

# --- 4. IMAGE SEARCH (OPTIONAL - CHOOSE ONE) ---
# Recommendation: Use Pexels for higher limits (200/hr)
PEXELS_API_KEY=
UNSPLASH_ACCESS_KEY=

# --- 5. FALLBACK ---
# Used if Groq is down.
HUGGINGFACE_API_KEY=
```

---

## 2. Detailed Feature Mapping

### A. Deep Research & Report Writing
The system prioritizes models with **Large Context Windows** for writing the final report to ensure no data is lost.

| Priority | Provider | API Key Variable | Model ID | Why? |
| :--- | :--- | :--- | :--- | :--- |
| **1 (Primary)** | **Google Gemini** | `GOOGLE_API_KEY` | `gemini-2.5-flash` | 1M Token Context, Native Internet Access. |
| **2 (Backup)** | **Groq** | `GROQ_API_KEY` | `llama3-70b-8192` | Extremely fast, but smaller context window. |

### C. Web Search & Images
The system needs to access the live internet.

| Priority | Provider | Key Variable | Daily Limit (Free) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Tavily** | `TAVILY_API_KEY` | ~33 (1k/mo) | Best quality for agents, but low limit. |
| **2** | **Gemini Search** | `GOOGLE_API_KEY` | ~1,500 | **Best Free Option**. Runs when Tavily key is missing. |

### D. Image Sources

| Priority | Provider | Key Variable | Hourly Limit (Free) |
| :--- | :--- | :--- | :--- |
| **1** | **Pexels** | `PEXELS_API_KEY` | **200** | Best free high-limit option. |
| **2** | **Unsplash** | `UNSPLASH_ACCESS_KEY` | 50 | Good quality, strict limits. |

# JARVIS Research System

An advanced, agentic web research application powered by Google Gemini, Groq, and Tavily.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
**Crucial Step:** Rename or copy the `.env` file and fill in your keys.
See **[API_GUIDE.md](./API_GUIDE.md)** for a detailed explanation of which key controls which feature.

```env
GROQ_API_KEY=...
TAVILY_API_KEY=...
GOOGLE_API_KEY=...
```

### 3. Run Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Python Agents (Optional)
If you wish to run the backend agents via Python instead of the browser:

1. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the LangGraph entry point:
   ```bash
   python python_langgraph/main.py
   ```

## Architecture
- **Frontend:** React + Vite + Tailwind
- **Intelligence:** Groq (Llama 3), Google Gemini 2.5 Flash
- **Search:** Tavily AI

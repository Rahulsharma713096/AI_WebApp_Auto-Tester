import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import uvicorn
from fastapi import FastAPI

app = FastAPI(title="AI Orchestrator Service")


@app.post("/analyze")
async def analyze(data: dict):
    url = data.get("url", "")
    profile = data.get("profile", "basic")
    if not url:
        return {"error": "No URL provided"}
    from orchestrator import AIOrchestrator
    orchestrator = AIOrchestrator(provider=os.getenv("AI_PROVIDER", "openai"))
    result = await orchestrator.analyze_url(url, profile)
    return result


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-orchestrator"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

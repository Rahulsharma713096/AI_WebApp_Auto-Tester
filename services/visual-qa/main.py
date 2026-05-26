import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Visual QA Service")


@app.post("/analyze")
async def analyze_screenshot(data: dict):
    return {"status": "ok", "message": "Visual QA analysis stub", "issues": []}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)

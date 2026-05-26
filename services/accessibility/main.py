from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Accessibility Service")


@app.post("/analyze")
async def analyze_accessibility(data: dict):
    return {"status": "ok", "message": "Accessibility analysis stub", "issues": [], "score": 100}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)

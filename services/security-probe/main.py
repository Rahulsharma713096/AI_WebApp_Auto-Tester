from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Security Probe Service")


@app.post("/scan")
async def scan_url(data: dict):
    return {
        "status": "ok",
        "message": "Security scan stub",
        "issues": [],
        "risk_score": 0,
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)

from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Playwright Runtime Service")


@app.post("/run")
async def run_test(data: dict):
    url = data.get("url", "")
    if not url:
        return {"error": "No URL provided"}
    from browser.runner import run_test as run_playwright
    import asyncio
    result = await run_playwright(url)
    return result


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "runtime"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import uvicorn
from fastapi import FastAPI

app = FastAPI(title="Playwright Runtime Service")


@app.post("/run")
async def run_page_test(data: dict):
    url = data.get("url", "")
    if not url:
        return {"error": "No URL provided"}
    from browser.runner import run_test
    result = await run_test(url)
    return result


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "runtime"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8005, reload=True)

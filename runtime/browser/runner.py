import asyncio
import time
import json
from typing import Optional
from dataclasses import dataclass, field, asdict


@dataclass
class PageResult:
    url: str
    title: str
    screenshot_path: Optional[str]
    console_logs: list[dict]
    network_requests: list[dict]
    html_snapshot: Optional[str]
    duration: float


@dataclass
class RunResult:
    pages: list[PageResult]
    total_duration: float
    error: Optional[str] = None


class PlaywrightRunner:
    def __init__(self, headless: bool = True, viewport: dict = None):
        self.headless = headless
        self.viewport = viewport or {"width": 1280, "height": 720}

    async def run(self, url: str, screenshot_dir: str = "./runtime/screenshots") -> RunResult:
        start = time.time()
        pages = []

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=self.headless)
                context = await browser.new_context(viewport=self.viewport)
                page = await context.new_page()

                console_logs = []
                network_requests = []

                page.on("console", lambda msg: console_logs.append({
                    "type": msg.type,
                    "text": msg.text,
                    "timestamp": time.time(),
                }))

                page.on("request", lambda req: network_requests.append({
                    "url": req.url,
                    "method": req.method,
                    "type": req.resource_type,
                    "timestamp": time.time(),
                }))

                page.on("response", lambda res: network_requests.append({
                    "url": res.url,
                    "status": res.status,
                    "method": res.request.method,
                    "timestamp": time.time(),
                }))

                page_load_start = time.time()
                await page.goto(url, wait_until="networkidle", timeout=30000)
                page_load_time = time.time() - page_load_start

                import os
                os.makedirs(screenshot_dir, exist_ok=True)
                screenshot_filename = f"{int(time.time())}.png"
                screenshot_path = os.path.join(screenshot_dir, screenshot_filename)
                await page.screenshot(path=screenshot_path, full_page=True)

                title = await page.title()
                html = await page.content()

                page_result = PageResult(
                    url=url,
                    title=title,
                    screenshot_path=screenshot_path,
                    console_logs=console_logs[-50:],
                    network_requests=network_requests[-100:],
                    html_snapshot=html[:50000],
                    duration=page_load_time,
                )
                pages.append(page_result)

                await browser.close()

        except Exception as e:
            return RunResult(pages=[], total_duration=time.time() - start, error=str(e))

        total_duration = time.time() - start
        return RunResult(pages=pages, total_duration=total_duration)


async def run_test(url: str, screenshot_dir: str = "./runtime/screenshots") -> dict:
    runner = PlaywrightRunner()
    result = await runner.run(url, screenshot_dir)
    return {
        "pages": [asdict(p) for p in result.pages],
        "total_duration": result.total_duration,
        "error": result.error,
    }

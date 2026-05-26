import asyncio
import os
import time
from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class PageResult:
    url: str
    title: str
    screenshot_path: Optional[str]
    console_logs: list
    network_requests: list
    html_snapshot: Optional[str]
    duration: float


@dataclass
class RunResult:
    pages: list
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
                network_reqs = {}
                network_responses = []

                def on_console(msg):
                    console_logs.append({
                        "type": msg.type,
                        "text": msg.text,
                        "timestamp": time.time(),
                    })

                def on_request(req):
                    network_reqs[req.url] = {
                        "url": req.url,
                        "method": req.method,
                        "type": req.resource_type,
                        "timestamp": time.time(),
                    }

                def on_response(res):
                    network_responses.append({
                        "url": res.url,
                        "status": res.status,
                        "method": res.request.method,
                        "timestamp": time.time(),
                    })

                page.on("console", on_console)
                page.on("request", on_request)
                page.on("response", on_response)

                page_load_start = time.time()
                await page.goto(url, wait_until="networkidle", timeout=30000)
                page_load_time = time.time() - page_load_start

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
                    network_requests=network_responses[-100:],
                    html_snapshot=html[:50000],
                    duration=page_load_time,
                )
                pages.append(page_result)

                await browser.close()

        except Exception as e:
            return RunResult(pages=[], total_duration=time.time() - start, error=str(e))

        total_duration = time.time() - start
        return RunResult(pages=pages, total_duration=total_duration)


async def run_test(target_url: str, screenshot_dir: str = "./runtime/screenshots") -> dict:
    runner = PlaywrightRunner()
    result = await runner.run(target_url, screenshot_dir)
    return {
        "pages": [asdict(p) for p in result.pages],
        "total_duration": result.total_duration,
        "error": result.error,
    }


if __name__ == "__main__":
    result = asyncio.run(run_test("https://example.com"))
    print(f"Done. Duration: {result['total_duration']:.1f}s, Error: {result['error']}")

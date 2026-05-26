import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from agents.planner import (
    AccessibilityAgent,
    FunctionalFlowAgent,
    SecurityProbeAgent,
    TestPlannerAgent,
    VisualQAAgent,
)
from llm.provider import LLMProvider, get_llm_provider


class AIOrchestrator:
    def __init__(self, provider: str = "openai"):
        self.provider_name = provider
        self.llm: LLMProvider = get_llm_provider(provider)
        self.planner = TestPlannerAgent(self.llm)
        self.functional = FunctionalFlowAgent(self.llm)
        self.visual = VisualQAAgent(self.llm)
        self.accessibility = AccessibilityAgent(self.llm)
        self.security = SecurityProbeAgent(self.llm)

    async def analyze_url(self, url: str, profile: str = "basic") -> dict:
        issues = []
        plan = await self.planner.generate_plan(url, profile)

        if profile in ("basic", "full"):
            func_issues = await self.functional.analyze(url, f"Page content for {url}")
            issues.extend(func_issues)

        if profile in ("full", "accessibility"):
            a11y_issues = await self.accessibility.analyze(f"Page content for {url}")
            issues.extend(a11y_issues)

        if profile in ("full", "security"):
            sec_issues = await self.security.scan(url, f"Page content for {url}")
            issues.extend(sec_issues)

        return {
            "plan": plan,
            "issues": issues,
            "summary": {
                "total_issues": len(issues),
                "provider_used": self.provider_name,
            },
        }

    async def analyze_screenshot(self, screenshot_url: str) -> list[dict]:
        return await self.visual.analyze_screenshot(screenshot_url)

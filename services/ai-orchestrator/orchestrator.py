import json
import os
from typing import Optional
from .llm.provider import get_llm_provider, LLMProvider
from .agents.planner import (
    TestPlannerAgent,
    FunctionalFlowAgent,
    VisualQAAgent,
    AccessibilityAgent,
    SecurityProbeAgent,
)


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

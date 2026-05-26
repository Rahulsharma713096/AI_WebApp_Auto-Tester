import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from llm.provider import LLMProvider


class TestPlannerAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def generate_plan(self, url: str, profile: str = "basic") -> dict:
        prompt = f"""Analyze the URL {url} and generate a test plan for profile: {profile}.
Return a JSON object with:
- testPlan: array of test cases to run
- estimatedDuration: estimated time in seconds
- criticalPages: array of important page paths to check
- focusAreas: areas to focus on based on the profile

Profile '{profile}' means:
- basic: quick functional check
- full: comprehensive audit including visual, accessibility, security
- security: OWASP Top 10 focused
- accessibility: WCAG AA compliance focused

Return valid JSON only."""
        system = "You are a QA test planner. Generate structured test plans in JSON format."

        response = await self.llm.generate(prompt, system)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "testPlan": [{"title": f"Verify {url} loads", "type": "functional"}],
                "estimatedDuration": 30,
                "criticalPages": ["/"],
                "focusAreas": ["functionality", "performance"],
            }


class FunctionalFlowAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def analyze(self, url: str, page_content: str) -> list[dict]:
        prompt = f"""Analyze this webpage content from {url} for functional issues.
Return a JSON array of issues found. Each issue should have: title, description, severity (critical/high/medium/low/info), category, recommendation.

Page content (truncated):
{page_content[:3000]}"""
        system = "You are a QA engineer. Analyze web pages for functional bugs and usability issues."

        response = await self.llm.generate(prompt, system)
        try:
            issues = json.loads(response)
            if isinstance(issues, list):
                return issues
            return []
        except json.JSONDecodeError:
            return []


class VisualQAAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def analyze_screenshot(self, screenshot_url: str) -> list[dict]:
        prompt = """Analyze this screenshot for visual issues such as:
- Layout shifts or misalignment
- Color contrast problems
- Missing or overlapping elements
- Text truncation or overflow
- Broken images or icons

Return a JSON array of visual issues found."""
        system = "You are a visual QA engineer. Analyze screenshots for UI/UX defects."

        response = await self.llm.generate_with_image(prompt, screenshot_url, system)
        try:
            issues = json.loads(response)
            if isinstance(issues, list):
                return issues
            return []
        except json.JSONDecodeError:
            return []


class AccessibilityAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def analyze(self, page_content: str) -> list[dict]:
        prompt = f"""Analyze this webpage HTML for WCAG accessibility violations.
Check for: missing alt text, missing ARIA labels, insufficient color contrast, improper heading hierarchy, missing form labels, keyboard navigation issues.
Return a JSON array of accessibility issues with: title, description, severity, category, recommendation, element_selector.

HTML:
{page_content[:3000]}"""
        system = "You are an accessibility expert. Evaluate web pages against WCAG 2.1 AA standards."

        response = await self.llm.generate(prompt, system)
        try:
            issues = json.loads(response)
            if isinstance(issues, list):
                return issues
            return []
        except json.JSONDecodeError:
            return []


class SecurityProbeAgent:
    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def scan(self, url: str, page_content: str) -> list[dict]:
        prompt = f"""Analyze this webpage {url} for OWASP Top 10 security vulnerabilities.
Check for: exposed sensitive data, missing security headers, insecure forms, exposed configuration files, XSS vectors, CSRF issues.
Return a JSON array of security issues with: title, description, severity, category, recommendation.

Content: {page_content[:3000]}"""
        system = "You are a security engineer. Scan web applications for vulnerabilities."

        response = await self.llm.generate(prompt, system)
        try:
            issues = json.loads(response)
            if isinstance(issues, list):
                return issues
            return []
        except json.JSONDecodeError:
            return []

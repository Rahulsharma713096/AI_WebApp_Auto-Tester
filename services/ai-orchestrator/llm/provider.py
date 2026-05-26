import os
from abc import ABC, abstractmethod
from typing import Optional


class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

    @abstractmethod
    async def generate_with_image(
        self, prompt: str, image_url: str, system_prompt: Optional[str] = None
    ) -> str:
        pass


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.model = model

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            response = await client.chat.completions.create(
                model=self.model, messages=messages, temperature=0.3
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            return f"Error: {str(e)}"

    async def generate_with_image(
        self, prompt: str, image_url: str, system_prompt: Optional[str] = None
    ) -> str:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            })
            response = await client.chat.completions.create(
                model=self.model, messages=messages, temperature=0.3
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            return f"Error: {str(e)}"


class ClaudeProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        self.model = model

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=self.api_key)
            response = await client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt or "",
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text if response.content else ""
        except Exception as e:
            return f"Error: {str(e)}"

    async def generate_with_image(
        self, prompt: str, image_url: str, system_prompt: Optional[str] = None
    ) -> str:
        try:
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=self.api_key)
            response = await client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt or "",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image", "source": {"type": "url", "url": image_url}},
                    ],
                }],
            )
            return response.content[0].text if response.content else ""
        except Exception as e:
            return f"Error: {str(e)}"


def get_llm_provider(provider: str = "openai") -> LLMProvider:
    if provider == "claude":
        return ClaudeProvider()
    return OpenAIProvider()

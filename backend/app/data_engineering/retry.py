from collections.abc import Callable
from typing import Any, TypeVar

from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter

T = TypeVar("T")


def retryable(max_attempts: int = 3) -> Callable[[Callable[..., T]], Callable[..., T]]:
    return retry(
        reraise=True,
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential_jitter(initial=1, max=30),
        retry=retry_if_exception_type((TimeoutError, ConnectionError, OSError)),
    )


class SourceFetchError(RuntimeError):
    def __init__(self, source: str, message: str, context: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.source = source
        self.context = context or {}

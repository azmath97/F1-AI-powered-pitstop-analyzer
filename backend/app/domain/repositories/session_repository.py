from typing import Protocol
from uuid import UUID


class SessionRepository(Protocol):
    async def exists(self, session_id: UUID) -> bool:
        """Return whether a session exists."""
        ...

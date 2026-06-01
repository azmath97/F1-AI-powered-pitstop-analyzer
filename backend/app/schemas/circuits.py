from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CircuitRead(BaseModel):
    id: UUID
    circuit_key: int | None = None
    name: str
    country: str
    locality: str | None = None
    length_m: int | None = None

    model_config = ConfigDict(from_attributes=True)

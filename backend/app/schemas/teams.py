from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TeamRead(BaseModel):
    id: UUID
    constructor_id: str
    name: str
    nationality: str | None = None
    base_country: str | None = None
    color_hex: str | None = None

    model_config = ConfigDict(from_attributes=True)

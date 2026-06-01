from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DriverRead(BaseModel):
    id: UUID
    driver_number: int = Field(ge=1, le=99)
    code: str = Field(min_length=3, max_length=3)
    full_name: str
    country_code: str | None = Field(default=None, min_length=2, max_length=2)
    current_team_id: UUID | None = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)

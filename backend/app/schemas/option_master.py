from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ Option Schemas ============

class OptionBase(BaseModel):
    title: str


class OptionCreate(OptionBase):
    pass


class OptionUpdate(BaseModel):
    title: Optional[str] = None


class OptionResponse(OptionBase):
    id: int
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Option Dropdown Schemas ============

class OptionDropdownBase(BaseModel):
    name: str
    option_id: int
    status: str = "Active"
    default_value: bool = False
    company_id: Optional[int] = None


class OptionDropdownCreate(OptionDropdownBase):
    pass


class OptionDropdownUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    default_value: Optional[bool] = None
    company_id: Optional[int] = None


class OptionDropdownResponse(OptionDropdownBase):
    id: int
    created_by: Optional[int] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Combined Schemas ============

class OptionWithDropdownsResponse(OptionResponse):
    dropdowns: List[OptionDropdownResponse] = []

    class Config:
        from_attributes = True

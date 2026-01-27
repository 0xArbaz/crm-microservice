from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.pre_lead import PreLeadStatus, PreLeadSource


class PreLeadBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    source: PreLeadSource = PreLeadSource.WEBSITE
    source_details: Optional[str] = None
    product_interest: Optional[str] = None
    requirements: Optional[str] = None
    budget_range: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    notes: Optional[str] = None


class PreLeadCreate(PreLeadBase):
    assigned_to: Optional[int] = None


class PreLeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    source: Optional[PreLeadSource] = None
    source_details: Optional[str] = None
    status: Optional[PreLeadStatus] = None
    product_interest: Optional[str] = None
    requirements: Optional[str] = None
    budget_range: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[int] = None
    discard_reason: Optional[str] = None


class PreLeadValidate(BaseModel):
    """Schema for validating and converting pre-lead to lead"""
    priority: str = "medium"
    expected_value: Optional[float] = None
    notes: Optional[str] = None


class PreLeadDiscard(BaseModel):
    """Schema for discarding a pre-lead"""
    discard_reason: str


class PreLeadResponse(PreLeadBase):
    id: int
    status: PreLeadStatus
    is_converted: bool
    converted_lead_id: Optional[int] = None
    converted_at: Optional[datetime] = None
    assigned_to: Optional[int] = None
    discard_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PreLeadListResponse(BaseModel):
    items: list[PreLeadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

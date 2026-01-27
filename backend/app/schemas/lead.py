from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.lead import LeadStatus, LeadSource, LeadPriority


class LeadBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    source: LeadSource = LeadSource.DIRECT
    source_details: Optional[str] = None
    priority: LeadPriority = LeadPriority.MEDIUM
    expected_value: Optional[Decimal] = None
    currency: str = "INR"
    product_interest: Optional[str] = None
    requirements: Optional[str] = None
    expected_close_date: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    pincode: Optional[str] = None
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    assigned_to: Optional[int] = None
    pre_lead_id: Optional[int] = None


class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    source: Optional[LeadSource] = None
    source_details: Optional[str] = None
    status: Optional[LeadStatus] = None
    priority: Optional[LeadPriority] = None
    pipeline_stage: Optional[int] = None
    expected_value: Optional[Decimal] = None
    actual_value: Optional[Decimal] = None
    currency: Optional[str] = None
    product_interest: Optional[str] = None
    requirements: Optional[str] = None
    expected_close_date: Optional[datetime] = None
    next_follow_up: Optional[datetime] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    notes: Optional[str] = None
    loss_reason: Optional[str] = None
    assigned_to: Optional[int] = None


class LeadConvert(BaseModel):
    """Schema for converting lead to customer"""
    customer_code: Optional[str] = None
    customer_type: str = "business"
    credit_limit: Optional[Decimal] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    notes: Optional[str] = None


class LeadDiscard(BaseModel):
    """Schema for discarding/losing a lead"""
    loss_reason: str


class LeadResponse(LeadBase):
    id: int
    status: LeadStatus
    pipeline_stage: int
    actual_value: Optional[Decimal] = None
    last_contacted: Optional[datetime] = None
    next_follow_up: Optional[datetime] = None
    is_converted: bool
    converted_customer_id: Optional[int] = None
    converted_at: Optional[datetime] = None
    pre_lead_id: Optional[int] = None
    assigned_to: Optional[int] = None
    loss_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeadListResponse(BaseModel):
    items: list[LeadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

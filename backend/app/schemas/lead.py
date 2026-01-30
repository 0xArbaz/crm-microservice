from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from app.models.lead import LeadSource, LeadPriority


class LeadBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    company_code: Optional[str] = None
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
    # Location fields
    address: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    city_id: Optional[int] = None
    state: Optional[str] = None
    state_id: Optional[int] = None
    country: str = "India"
    country_id: Optional[int] = None
    pincode: Optional[str] = None
    zip_code: Optional[str] = None
    # Contact fields
    phone_no: Optional[str] = None
    fax: Optional[str] = None
    nof_representative: Optional[str] = None
    # Business fields
    memo: Optional[str] = None
    group_id: Optional[int] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    office_timings: Optional[str] = None
    timezone: Optional[str] = None
    lead_source: Optional[str] = None
    lead_score: Optional[int] = None
    sales_rep: Optional[str] = None
    lead_since: Optional[datetime] = None
    remarks: Optional[str] = None
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    assigned_to: Optional[int] = None
    pre_lead_id: Optional[int] = None
    # Frontend sends from_timings and to_timings separately
    from_timings: Optional[str] = None
    to_timings: Optional[str] = None
    # Field mappings from frontend
    customer_name: Optional[str] = None  # Maps to company_name
    contact_phone: Optional[str] = None  # Maps to phone
    customer_email: Optional[str] = None  # Maps to email


class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    company_code: Optional[str] = None
    designation: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    source: Optional[LeadSource] = None
    source_details: Optional[str] = None
    status: Optional[int] = None  # 0 = active, 1 = discarded
    lead_status: Optional[str] = None  # new, contacted, qualified, proposal_sent, negotiation, won, lost
    priority: Optional[LeadPriority] = None
    pipeline_stage: Optional[int] = None
    expected_value: Optional[Decimal] = None
    actual_value: Optional[Decimal] = None
    currency: Optional[str] = None
    product_interest: Optional[str] = None
    requirements: Optional[str] = None
    expected_close_date: Optional[datetime] = None
    next_follow_up: Optional[datetime] = None
    # Location fields
    address: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    city_id: Optional[int] = None
    state: Optional[str] = None
    state_id: Optional[int] = None
    country: Optional[str] = None
    country_id: Optional[int] = None
    pincode: Optional[str] = None
    zip_code: Optional[str] = None
    # Contact fields
    phone_no: Optional[str] = None
    fax: Optional[str] = None
    nof_representative: Optional[str] = None
    # Business fields
    memo: Optional[str] = None
    group_id: Optional[int] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    office_timings: Optional[str] = None
    timezone: Optional[str] = None
    lead_source: Optional[str] = None
    lead_score: Optional[int] = None
    sales_rep: Optional[str] = None
    lead_since: Optional[datetime] = None
    remarks: Optional[str] = None
    notes: Optional[str] = None
    loss_reason: Optional[str] = None
    assigned_to: Optional[int] = None
    # Frontend sends from_timings and to_timings separately
    from_timings: Optional[str] = None
    to_timings: Optional[str] = None
    # Field mappings from frontend
    customer_name: Optional[str] = None  # Maps to company_name
    contact_phone: Optional[str] = None  # Maps to phone
    customer_email: Optional[str] = None  # Maps to email


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
    status: int  # 0 = active, 1 = discarded
    lead_status: Optional[str] = None  # new, contacted, qualified, proposal_sent, negotiation, won, lost
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
    # System tracking fields
    company_id: Optional[int] = None
    createdby: Optional[int] = None
    updatedby: Optional[int] = None
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

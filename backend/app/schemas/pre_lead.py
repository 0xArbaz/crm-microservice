from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
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
    # New fields
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city_id: Optional[int] = None
    zip_code: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    phone_no: Optional[str] = None
    fax: Optional[str] = None
    nof_representative: Optional[str] = None
    memo: Optional[str] = None
    group_id: Optional[int] = None
    lead_status: Optional[str] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    office_timings: Optional[str] = None
    timezone: Optional[str] = None
    lead_source: Optional[str] = None
    sales_rep: Optional[int] = None
    lead_since: Optional[date] = None
    remarks: Optional[str] = None
    lead_score: Optional[str] = None


class PreLeadCreate(PreLeadBase):
    assigned_to: Optional[int] = None
    # Frontend timing fields - will be combined into office_timings
    from_timings: Optional[str] = None
    to_timings: Optional[str] = None
    # System fields - auto-assigned
    company_id: Optional[int] = None
    createdby: Optional[int] = None
    updatedby: Optional[int] = None

    @field_validator('first_name', mode='before')
    @classmethod
    def set_first_name_from_company(cls, v, info):
        # If first_name is empty, use company_name
        if not v and info.data.get('company_name'):
            return info.data.get('company_name')
        return v or 'Unknown'


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
    # New fields
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city_id: Optional[int] = None
    zip_code: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    phone_no: Optional[str] = None
    fax: Optional[str] = None
    nof_representative: Optional[str] = None
    memo: Optional[str] = None
    group_id: Optional[int] = None
    lead_status: Optional[str] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    office_timings: Optional[str] = None
    timezone: Optional[str] = None
    lead_source: Optional[str] = None
    sales_rep: Optional[int] = None
    lead_since: Optional[date] = None
    remarks: Optional[str] = None
    lead_score: Optional[str] = None
    from_timings: Optional[str] = None
    to_timings: Optional[str] = None
    company_id: Optional[int] = None
    updatedby: Optional[int] = None


class PreLeadValidate(BaseModel):
    """Schema for validating and converting pre-lead to lead"""
    priority: str = "medium"
    expected_value: Optional[float] = None
    notes: Optional[str] = None


class PreLeadDiscard(BaseModel):
    """Schema for discarding a pre-lead"""
    discard_reason: str


class PreLeadResponse(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    source: PreLeadSource
    source_details: Optional[str] = None
    status: PreLeadStatus
    product_interest: Optional[str] = None
    requirements: Optional[str] = None
    budget_range: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    notes: Optional[str] = None
    is_converted: bool
    converted_lead_id: Optional[int] = None
    converted_at: Optional[datetime] = None
    assigned_to: Optional[int] = None
    discard_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    # New fields
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city_id: Optional[int] = None
    zip_code: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    phone_no: Optional[str] = None
    fax: Optional[str] = None
    nof_representative: Optional[str] = None
    memo: Optional[str] = None
    group_id: Optional[int] = None
    lead_status: Optional[str] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    office_timings: Optional[str] = None
    timezone: Optional[str] = None
    lead_source: Optional[str] = None
    sales_rep: Optional[int] = None
    lead_since: Optional[date] = None
    remarks: Optional[str] = None
    lead_score: Optional[str] = None
    company_id: Optional[int] = None
    createdby: Optional[int] = None
    updatedby: Optional[int] = None

    class Config:
        from_attributes = True


class PreLeadListResponse(BaseModel):
    items: list[PreLeadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

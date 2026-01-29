from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date


# ============== Lead Contact Schemas ==============

class LeadContactBase(BaseModel):
    contact_type: str = "primary"
    title: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    is_primary: bool = False
    email: Optional[EmailStr] = None
    work_email: Optional[EmailStr] = None
    personal_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    work_phone: Optional[str] = None
    ext: Optional[str] = None
    fax: Optional[str] = None
    cell_phone: Optional[str] = None
    home_phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    status: str = "active"
    notes: Optional[str] = None


class LeadContactCreate(LeadContactBase):
    lead_id: int


class LeadContactUpdate(BaseModel):
    contact_type: Optional[str] = None
    title: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    is_primary: Optional[bool] = None
    email: Optional[EmailStr] = None
    work_email: Optional[EmailStr] = None
    personal_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    work_phone: Optional[str] = None
    ext: Optional[str] = None
    fax: Optional[str] = None
    cell_phone: Optional[str] = None
    home_phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class LeadContactResponse(LeadContactBase):
    id: int
    lead_id: int
    image: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Lead Activity Schemas ==============

class LeadActivityBase(BaseModel):
    activity_type: str
    subject: str
    description: Optional[str] = None
    outcome: Optional[str] = None
    activity_date: date
    due_date: Optional[date] = None
    is_completed: bool = False


class LeadActivityCreate(LeadActivityBase):
    lead_id: int
    contact_id: Optional[int] = None


class LeadActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    outcome: Optional[str] = None
    activity_date: Optional[date] = None
    due_date: Optional[date] = None
    is_completed: Optional[bool] = None
    contact_id: Optional[int] = None


class LeadActivityResponse(LeadActivityBase):
    id: int
    lead_id: int
    contact_id: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    performed_by: Optional[int] = None

    class Config:
        from_attributes = True


# ============== Lead Memo Schemas ==============

class LeadMemoBase(BaseModel):
    memo_type: str = "general"
    title: str
    content: str


class LeadMemoCreate(LeadMemoBase):
    lead_id: int


class LeadMemoUpdate(BaseModel):
    memo_type: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None


class LeadMemoResponse(LeadMemoBase):
    id: int
    lead_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True


# ============== Lead Document Schemas ==============

class LeadDocumentBase(BaseModel):
    notes: Optional[str] = None


class LeadDocumentCreate(LeadDocumentBase):
    lead_id: int
    name: str
    original_name: Optional[str] = None
    file_path: str
    file_type: Optional[str] = None
    size: Optional[int] = None


class LeadDocumentResponse(BaseModel):
    id: int
    lead_id: int
    name: str
    original_name: Optional[str] = None
    file_path: str
    file_type: Optional[str] = None
    size: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    uploaded_by: Optional[int] = None

    class Config:
        from_attributes = True


# ============== Lead Status History Schemas ==============

class LeadStatusHistoryBase(BaseModel):
    status: str
    status_date: Optional[date] = None
    remarks: Optional[str] = None


class LeadStatusHistoryCreate(LeadStatusHistoryBase):
    lead_id: int


class LeadStatusHistoryResponse(LeadStatusHistoryBase):
    id: int
    lead_id: int
    created_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True


# ============== Lead Qualified Profile Schemas ==============

class LeadQualifiedProfileBase(BaseModel):
    profile_type: str = "basic"
    company_name: Optional[str] = None
    company_type: Optional[str] = None
    industry_id: Optional[int] = None
    annual_revenue: Optional[str] = None
    employee_count: Optional[str] = None
    decision_maker: Optional[str] = None
    decision_process: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    competitors: Optional[str] = None
    current_solution: Optional[str] = None
    pain_points: Optional[str] = None
    requirements: Optional[str] = None
    notes: Optional[str] = None


class LeadQualifiedProfileCreate(LeadQualifiedProfileBase):
    lead_id: int


class LeadQualifiedProfileUpdate(BaseModel):
    profile_type: Optional[str] = None
    company_name: Optional[str] = None
    company_type: Optional[str] = None
    industry_id: Optional[int] = None
    annual_revenue: Optional[str] = None
    employee_count: Optional[str] = None
    decision_maker: Optional[str] = None
    decision_process: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    competitors: Optional[str] = None
    current_solution: Optional[str] = None
    pain_points: Optional[str] = None
    requirements: Optional[str] = None
    notes: Optional[str] = None


class LeadQualifiedProfileResponse(LeadQualifiedProfileBase):
    id: int
    lead_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Combined Response for Edit Page ==============

class LeadFullResponse(BaseModel):
    """Full response with all related entities for edit page"""
    id: int
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    website: Optional[str] = None
    status: str
    source: str
    priority: str
    pipeline_stage: int
    expected_value: Optional[float] = None
    # Address fields
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city_id: Optional[int] = None
    state_id: Optional[int] = None
    country_id: Optional[int] = None
    zip_code: Optional[str] = None
    # Business fields
    phone_no: Optional[str] = None
    fax: Optional[str] = None
    nof_representative: Optional[str] = None
    group_id: Optional[int] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    office_timings: Optional[str] = None
    timezone: Optional[str] = None
    sales_rep: Optional[str] = None
    lead_source: Optional[str] = None
    lead_score: Optional[int] = None
    lead_since: Optional[date] = None
    remarks: Optional[str] = None
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Related entities
    contacts: List[LeadContactResponse] = []
    activities: List[LeadActivityResponse] = []
    memos: List[LeadMemoResponse] = []
    documents: List[LeadDocumentResponse] = []
    status_history: List[LeadStatusHistoryResponse] = []
    qualified_profiles: List[LeadQualifiedProfileResponse] = []

    class Config:
        from_attributes = True

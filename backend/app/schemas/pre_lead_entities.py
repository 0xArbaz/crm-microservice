from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date


# ============== Pre-Lead Contact Schemas ==============

class PreLeadContactBase(BaseModel):
    contact_type: str = "primary"
    title: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    designation: Optional[str] = None
    work_email: Optional[EmailStr] = None
    personal_email: Optional[EmailStr] = None
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


class PreLeadContactCreate(PreLeadContactBase):
    pre_lead_id: int


class PreLeadContactUpdate(BaseModel):
    contact_type: Optional[str] = None
    title: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    designation: Optional[str] = None
    work_email: Optional[EmailStr] = None
    personal_email: Optional[EmailStr] = None
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


class PreLeadContactResponse(PreLeadContactBase):
    id: int
    pre_lead_id: int
    image: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Pre-Lead Activity Schemas ==============

class PreLeadActivityBase(BaseModel):
    activity_type: str
    subject: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    start_time: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    priority: str = "medium"
    status: str = "pending"
    category: Optional[str] = None
    assigned_to: Optional[int] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    fax_no: Optional[str] = None


class PreLeadActivityCreate(PreLeadActivityBase):
    pre_lead_id: int
    contact_id: Optional[int] = None


class PreLeadActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    start_time: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    assigned_to: Optional[int] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_id: Optional[int] = None


class PreLeadActivityResponse(PreLeadActivityBase):
    id: int
    pre_lead_id: int
    contact_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Pre-Lead Memo Schemas ==============

class PreLeadMemoBase(BaseModel):
    details: str


class PreLeadMemoCreate(PreLeadMemoBase):
    pre_lead_id: int


class PreLeadMemoUpdate(BaseModel):
    details: Optional[str] = None


class PreLeadMemoResponse(PreLeadMemoBase):
    id: int
    pre_lead_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True


# ============== Pre-Lead Document Schemas ==============

class PreLeadDocumentBase(BaseModel):
    notes: Optional[str] = None


class PreLeadDocumentCreate(PreLeadDocumentBase):
    pre_lead_id: int
    name: str
    original_name: Optional[str] = None
    file_path: str
    file_type: Optional[str] = None
    size: Optional[int] = None


class PreLeadDocumentResponse(BaseModel):
    id: int
    pre_lead_id: int
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


# ============== Pre-Lead Status History Schemas ==============

class PreLeadStatusHistoryBase(BaseModel):
    status: str
    status_date: Optional[date] = None
    remarks: Optional[str] = None


class PreLeadStatusHistoryCreate(PreLeadStatusHistoryBase):
    pre_lead_id: int


class PreLeadStatusHistoryResponse(PreLeadStatusHistoryBase):
    id: int
    pre_lead_id: int
    created_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True


# ============== Qualified Lead Profile Schemas ==============

class QualifiedLeadProfileBase(BaseModel):
    contact_id: Optional[int] = None
    company_name: Optional[str] = None
    industry_id: Optional[int] = None
    best_time_call: Optional[str] = None
    best_time_call_timezone: Optional[int] = None
    mode: Optional[str] = None
    contact_name: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    need_type: Optional[int] = None
    current_software: Optional[str] = None
    need_summary: Optional[str] = None
    budget: Optional[int] = None
    decision_maker: Optional[int] = None
    time_frame: Optional[int] = None
    qualified_by: Optional[int] = None
    company_profile: Optional[str] = None
    summary_of_discussion: Optional[str] = None
    conclusion: Optional[str] = None
    status: str = "draft"


class QualifiedLeadProfileCreate(QualifiedLeadProfileBase):
    pre_lead_id: int


class QualifiedLeadProfileUpdate(BaseModel):
    contact_id: Optional[int] = None
    company_name: Optional[str] = None
    industry_id: Optional[int] = None
    best_time_call: Optional[str] = None
    best_time_call_timezone: Optional[int] = None
    mode: Optional[str] = None
    contact_name: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    need_type: Optional[int] = None
    current_software: Optional[str] = None
    need_summary: Optional[str] = None
    budget: Optional[int] = None
    decision_maker: Optional[int] = None
    time_frame: Optional[int] = None
    qualified_by: Optional[int] = None
    company_profile: Optional[str] = None
    summary_of_discussion: Optional[str] = None
    conclusion: Optional[str] = None
    status: Optional[str] = None


class QualifiedLeadProfileResponse(QualifiedLeadProfileBase):
    id: int
    pre_lead_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Combined Response for Edit Page ==============

class PreLeadFullResponse(BaseModel):
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
    sales_rep: Optional[int] = None
    lead_source: Optional[str] = None
    lead_status: Optional[str] = None
    lead_score: Optional[str] = None
    lead_since: Optional[date] = None
    remarks: Optional[str] = None
    memo: Optional[str] = None
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Related entities
    contacts: List[PreLeadContactResponse] = []
    activities: List[PreLeadActivityResponse] = []
    memos: List[PreLeadMemoResponse] = []
    documents: List[PreLeadDocumentResponse] = []
    status_history: List[PreLeadStatusHistoryResponse] = []
    qualified_profiles: List[QualifiedLeadProfileResponse] = []

    class Config:
        from_attributes = True

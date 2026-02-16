from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, date


# ============== Customer Requirement ==============

class CustomerRequirementCreate(BaseModel):
    lead_id: int
    company_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    zip_code: Optional[str] = None
    phone_no: Optional[str] = None
    phone_ext: Optional[str] = None
    fax: Optional[str] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_ext: Optional[str] = None
    contact_email: Optional[str] = None
    best_time_call: Optional[str] = None
    mode: Optional[str] = None
    branch_office: Optional[str] = None
    no_of_employees: Optional[int] = None
    instance_required: Optional[str] = None
    ecommerce: Optional[bool] = False
    group_id: Optional[int] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    timezone_id: Optional[int] = None
    sales_rep_id: Optional[int] = None
    lead_source_id: Optional[int] = None
    lead_from_id: Optional[int] = None
    lead_from_name: Optional[str] = None
    lead_score: Optional[str] = None
    remarks: Optional[str] = None
    office_timing_from: Optional[str] = None
    office_timing_to: Optional[str] = None
    need_type: Optional[str] = None
    budget: Optional[str] = None
    time_frame: Optional[str] = None
    current_it_infrastructure: Optional[str] = None
    current_software: Optional[str] = None
    need_summary: Optional[str] = None
    decision_maker: Optional[str] = None
    qualified_by: Optional[str] = None
    company_profile: Optional[str] = None
    summary: Optional[str] = None
    conclusion: Optional[str] = None


class CustomerRequirementUpdate(BaseModel):
    company_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    zip_code: Optional[str] = None
    phone_no: Optional[str] = None
    phone_ext: Optional[str] = None
    fax: Optional[str] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_ext: Optional[str] = None
    contact_email: Optional[str] = None
    best_time_call: Optional[str] = None
    mode: Optional[str] = None
    branch_office: Optional[str] = None
    no_of_employees: Optional[int] = None
    instance_required: Optional[str] = None
    ecommerce: Optional[bool] = None
    group_id: Optional[int] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    timezone_id: Optional[int] = None
    sales_rep_id: Optional[int] = None
    lead_source_id: Optional[int] = None
    lead_from_id: Optional[int] = None
    lead_from_name: Optional[str] = None
    lead_score: Optional[str] = None
    remarks: Optional[str] = None
    office_timing_from: Optional[str] = None
    office_timing_to: Optional[str] = None
    need_type: Optional[str] = None
    budget: Optional[str] = None
    time_frame: Optional[str] = None
    current_it_infrastructure: Optional[str] = None
    current_software: Optional[str] = None
    need_summary: Optional[str] = None
    decision_maker: Optional[str] = None
    qualified_by: Optional[str] = None
    company_profile: Optional[str] = None
    summary: Optional[str] = None
    conclusion: Optional[str] = None
    current_tab: Optional[str] = None
    status: Optional[str] = None


class CustomerRequirementResponse(BaseModel):
    id: int
    lead_id: int
    company_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    zip_code: Optional[str] = None
    phone_no: Optional[str] = None
    phone_ext: Optional[str] = None
    fax: Optional[str] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_ext: Optional[str] = None
    contact_email: Optional[str] = None
    best_time_call: Optional[str] = None
    mode: Optional[str] = None
    branch_office: Optional[str] = None
    no_of_employees: Optional[int] = None
    instance_required: Optional[str] = None
    ecommerce: Optional[bool] = None
    group_id: Optional[int] = None
    industry_id: Optional[int] = None
    region_id: Optional[int] = None
    timezone_id: Optional[int] = None
    sales_rep_id: Optional[int] = None
    lead_source_id: Optional[int] = None
    lead_from_id: Optional[int] = None
    lead_from_name: Optional[str] = None
    lead_score: Optional[str] = None
    remarks: Optional[str] = None
    office_timing_from: Optional[str] = None
    office_timing_to: Optional[str] = None
    need_type: Optional[str] = None
    budget: Optional[str] = None
    time_frame: Optional[str] = None
    current_it_infrastructure: Optional[str] = None
    current_software: Optional[str] = None
    need_summary: Optional[str] = None
    decision_maker: Optional[str] = None
    qualified_by: Optional[str] = None
    company_profile: Optional[str] = None
    summary: Optional[str] = None
    conclusion: Optional[str] = None
    current_tab: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Introduction ==============

class CRIntroductionCreate(BaseModel):
    contact_ids: Optional[str] = None
    email_format: Optional[str] = None
    email_content: Optional[str] = None
    notes: Optional[str] = None


class CRIntroductionUpdate(CRIntroductionCreate):
    pass


class CRIntroductionResponse(BaseModel):
    id: int
    customer_requirement_id: int
    contact_ids: Optional[str] = None
    email_format: Optional[str] = None
    email_content: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Requirement ==============

class CRRequirementCreate(BaseModel):
    software_type: Optional[str] = None
    modules_required: Optional[str] = None
    ecommerce_required: Optional[bool] = False
    ecommerce_modules: Optional[str] = None
    business_analysis: Optional[str] = None
    functional_analysis: Optional[str] = None
    software_analysis: Optional[str] = None
    process_flow_diagram: Optional[str] = None
    process_flow_notes: Optional[str] = None
    status: Optional[str] = 'pending'


class CRRequirementUpdate(CRRequirementCreate):
    pass


class CRRequirementResponse(BaseModel):
    id: int
    customer_requirement_id: int
    software_type: Optional[str] = None
    modules_required: Optional[str] = None
    ecommerce_required: Optional[bool] = None
    ecommerce_modules: Optional[str] = None
    business_analysis: Optional[str] = None
    functional_analysis: Optional[str] = None
    software_analysis: Optional[str] = None
    process_flow_diagram: Optional[str] = None
    process_flow_notes: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Presentation ==============

class CRPresentationCreate(BaseModel):
    presentation_date: Optional[date] = None
    presentation_time: Optional[str] = None
    presenter_id: Optional[int] = None
    attendees: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = 'scheduled'
    presentation_modules: Optional[str] = None


class CRPresentationUpdate(CRPresentationCreate):
    pass


class CRPresentationResponse(BaseModel):
    id: int
    customer_requirement_id: int
    presentation_date: Optional[date] = None
    presentation_time: Optional[str] = None
    presenter_id: Optional[int] = None
    attendees: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    presentation_modules: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Demo ==============

class CRDemoCreate(BaseModel):
    demo_date: Optional[date] = None
    demo_time: Optional[str] = None
    demo_type: Optional[str] = None
    presenter_id: Optional[int] = None
    attendees: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    modules_to_demo: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    status: Optional[str] = 'scheduled'


class CRDemoUpdate(CRDemoCreate):
    pass


class CRDemoResponse(BaseModel):
    id: int
    customer_requirement_id: int
    demo_date: Optional[date] = None
    demo_time: Optional[str] = None
    demo_type: Optional[str] = None
    presenter_id: Optional[int] = None
    attendees: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    modules_to_demo: Optional[str] = None
    notes: Optional[str] = None
    feedback: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Proposal ==============

class CRProposalCreate(BaseModel):
    proposal_number: Optional[str] = None
    proposal_date: Optional[date] = None
    valid_until: Optional[date] = None
    subtotal: Optional[float] = 0
    discount: Optional[float] = 0
    tax: Optional[float] = 0
    total: Optional[float] = 0
    currency: Optional[str] = 'USD'
    purpose: Optional[str] = None
    scope: Optional[str] = None
    deliverables: Optional[str] = None
    terms_conditions: Optional[str] = None
    status: Optional[str] = 'draft'


class CRProposalUpdate(CRProposalCreate):
    pass


class CRProposalResponse(BaseModel):
    id: int
    customer_requirement_id: int
    proposal_number: Optional[str] = None
    proposal_date: Optional[date] = None
    valid_until: Optional[date] = None
    subtotal: Optional[float] = None
    discount: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    currency: Optional[str] = None
    purpose: Optional[str] = None
    scope: Optional[str] = None
    deliverables: Optional[str] = None
    terms_conditions: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Agreement ==============

class CRAgreementCreate(BaseModel):
    agreement_number: Optional[str] = None
    agreement_date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    agreement_type: Optional[str] = None
    agreement_value: Optional[float] = 0
    currency: Optional[str] = 'USD'
    terms: Optional[str] = None
    special_conditions: Optional[str] = None
    signed_by_customer: Optional[bool] = False
    signed_by_company: Optional[bool] = False
    customer_signatory: Optional[str] = None
    company_signatory: Optional[str] = None
    status: Optional[str] = 'draft'


class CRAgreementUpdate(CRAgreementCreate):
    pass


class CRAgreementResponse(BaseModel):
    id: int
    customer_requirement_id: int
    agreement_number: Optional[str] = None
    agreement_date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    agreement_type: Optional[str] = None
    agreement_value: Optional[float] = None
    currency: Optional[str] = None
    terms: Optional[str] = None
    special_conditions: Optional[str] = None
    signed_by_customer: Optional[bool] = None
    signed_by_company: Optional[bool] = None
    customer_signatory: Optional[str] = None
    company_signatory: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Generic Tab Data Schemas ==============

class CRDocumentCreate(BaseModel):
    tab_name: str
    sub_tab_name: Optional[str] = None
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    description: Optional[str] = None


class CRDocumentResponse(BaseModel):
    id: int
    customer_requirement_id: int
    tab_name: str
    sub_tab_name: Optional[str] = None
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    description: Optional[str] = None
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CRActivityCreate(BaseModel):
    tab_name: str
    activity_type: str
    subject: str
    description: Optional[str] = None
    contact_id: Optional[int] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    source: Optional[str] = None
    start_date: Optional[date] = None
    start_time: Optional[str] = None
    end_date: Optional[date] = None
    end_time: Optional[str] = None
    status: Optional[str] = 'planned'


class CRActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    contact_id: Optional[int] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    source: Optional[str] = None
    start_date: Optional[date] = None
    start_time: Optional[str] = None
    end_date: Optional[date] = None
    end_time: Optional[str] = None
    status: Optional[str] = None


class CRActivityResponse(BaseModel):
    id: int
    customer_requirement_id: int
    tab_name: str
    activity_type: str
    subject: str
    description: Optional[str] = None
    contact_id: Optional[int] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    source: Optional[str] = None
    start_date: Optional[date] = None
    start_time: Optional[str] = None
    end_date: Optional[date] = None
    end_time: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CRMemoCreate(BaseModel):
    tab_name: str
    title: Optional[str] = None
    content: str


class CRMemoUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class CRMemoResponse(BaseModel):
    id: int
    customer_requirement_id: int
    tab_name: str
    title: Optional[str] = None
    content: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CRCallLogCreate(BaseModel):
    call_date: Optional[date] = None
    call_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    call_type: Optional[str] = None
    contact_id: Optional[int] = None
    caller_id: Optional[int] = None
    subject: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    follow_up_required: Optional[bool] = False
    follow_up_date: Optional[date] = None


class CRCallLogUpdate(CRCallLogCreate):
    pass


class CRCallLogResponse(BaseModel):
    id: int
    customer_requirement_id: int
    call_date: Optional[date] = None
    call_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    call_type: Optional[str] = None
    contact_id: Optional[int] = None
    caller_id: Optional[int] = None
    subject: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Email History ==============

class CREmailHistoryCreate(BaseModel):
    tab_name: str
    template_id: Optional[int] = None
    template_name: Optional[str] = None
    to_email: str
    cc_email: Optional[str] = None
    bcc_email: Optional[str] = None
    email_name: Optional[str] = None
    subject: str
    content: Optional[str] = None
    attachment_ids: Optional[str] = None  # JSON array
    uploaded_attachments: Optional[str] = None  # JSON array


class CREmailHistoryResponse(BaseModel):
    id: int
    customer_requirement_id: int
    tab_name: str
    template_id: Optional[int] = None
    template_name: Optional[str] = None
    to_email: str
    cc_email: Optional[str] = None
    bcc_email: Optional[str] = None
    email_name: Optional[str] = None
    subject: str
    content: Optional[str] = None
    attachment_ids: Optional[str] = None
    uploaded_attachments: Optional[str] = None
    status: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


class SendEmailRequest(BaseModel):
    tab_name: str
    template_id: Optional[int] = None
    template_name: Optional[str] = None
    to_email: str
    cc_email: Optional[str] = None
    bcc_email: Optional[str] = None
    email_name: Optional[str] = None
    subject: str
    content: str
    attachment_ids: Optional[List[int]] = None  # List of document IDs to attach


# ============== Diligence Short Form (Pre-Demo Business Questionnaire) ==============

class CRDiligenceShortFormCreate(BaseModel):
    # Section 1: General Information
    company_name: Optional[str] = None
    key_person: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[int] = None
    state: Optional[int] = None
    postal_code: Optional[str] = None
    country: Optional[int] = None
    years_operation: Optional[str] = None
    branch_address: Optional[str] = None

    # Section 2: About Your Business - Years in Business
    years_1_5: Optional[bool] = False
    years_6_10: Optional[bool] = False
    years_11_50: Optional[bool] = False
    years_51_100: Optional[bool] = False

    # Section 2: Company Size
    size_1_5: Optional[bool] = False
    size_6_10: Optional[bool] = False
    size_11_50: Optional[bool] = False
    size_51_100: Optional[bool] = False
    size_100_plus: Optional[bool] = False

    # Section 2: Industry Type
    industry_trading: Optional[bool] = False
    industry_manufacturing: Optional[bool] = False
    industry_services: Optional[bool] = False
    industry_distribution: Optional[bool] = False
    industry_retail: Optional[bool] = False
    industry_projects: Optional[bool] = False
    industry_consulting: Optional[bool] = False
    industry_other_chk: Optional[bool] = False
    industry_other: Optional[str] = None

    # Section 2: Legal Structure
    legal_sole: Optional[bool] = False
    legal_partnership: Optional[bool] = False
    legal_llc: Optional[bool] = False

    # Section 2: Annual Revenue
    rev_100k: Optional[bool] = False
    rev_250k: Optional[bool] = False
    rev_1m: Optional[bool] = False
    rev_5m: Optional[bool] = False
    rev_10m: Optional[bool] = False
    rev_above_10m: Optional[bool] = False

    # Section 2: Market Reach
    market_local: Optional[bool] = False
    market_national: Optional[bool] = False
    market_international: Optional[bool] = False

    # Section 3: Current Systems
    sys_paper: Optional[bool] = False
    sys_account: Optional[bool] = False
    sys_crm: Optional[bool] = False
    sys_hrm: Optional[bool] = False
    sys_inv: Optional[bool] = False
    sys_erp: Optional[bool] = False
    sys_other_chk: Optional[bool] = False
    sys_other: Optional[str] = None

    # Section 4: Key Business Priorities
    key_cust: Optional[bool] = False
    key_proposal: Optional[bool] = False
    key_suppliers: Optional[bool] = False
    key_inventory: Optional[bool] = False
    key_financial: Optional[bool] = False
    key_employees: Optional[bool] = False
    key_projects: Optional[bool] = False
    key_dms: Optional[bool] = False
    key_reports: Optional[bool] = False
    key_integration: Optional[bool] = False
    key_multicurrency: Optional[bool] = False
    key_errors: Optional[bool] = False
    key_costs: Optional[bool] = False
    key_other_chk: Optional[bool] = False
    key_other: Optional[str] = None

    # Section 5: Main Business Challenges
    main_manual: Optional[bool] = False
    main_delay: Optional[bool] = False
    main_tracking: Optional[bool] = False
    main_payments: Optional[bool] = False
    main_suppliers: Optional[bool] = False
    main_inventory: Optional[bool] = False
    main_hr: Optional[bool] = False
    main_reports: Optional[bool] = False
    main_currency: Optional[bool] = False
    main_branches: Optional[bool] = False
    main_emp: Optional[bool] = False
    main_lack: Optional[bool] = False
    main_diff: Optional[bool] = False
    main_branch: Optional[bool] = False
    main_other_chk: Optional[bool] = False
    main_other: Optional[str] = None

    # Section 6: Other Requirements
    other_notes: Optional[str] = None

    submit_status: Optional[int] = 1


class CRDiligenceShortFormUpdate(CRDiligenceShortFormCreate):
    pass


class CRDiligenceShortFormResponse(BaseModel):
    id: int
    customer_requirement_id: int

    # Section 1: General Information
    company_name: Optional[str] = None
    key_person: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[int] = None
    state: Optional[int] = None
    postal_code: Optional[str] = None
    country: Optional[int] = None
    years_operation: Optional[str] = None
    branch_address: Optional[str] = None

    # Section 2: About Your Business - Years in Business
    years_1_5: Optional[bool] = None
    years_6_10: Optional[bool] = None
    years_11_50: Optional[bool] = None
    years_51_100: Optional[bool] = None

    # Section 2: Company Size
    size_1_5: Optional[bool] = None
    size_6_10: Optional[bool] = None
    size_11_50: Optional[bool] = None
    size_51_100: Optional[bool] = None
    size_100_plus: Optional[bool] = None

    # Section 2: Industry Type
    industry_trading: Optional[bool] = None
    industry_manufacturing: Optional[bool] = None
    industry_services: Optional[bool] = None
    industry_distribution: Optional[bool] = None
    industry_retail: Optional[bool] = None
    industry_projects: Optional[bool] = None
    industry_consulting: Optional[bool] = None
    industry_other_chk: Optional[bool] = None
    industry_other: Optional[str] = None

    # Section 2: Legal Structure
    legal_sole: Optional[bool] = None
    legal_partnership: Optional[bool] = None
    legal_llc: Optional[bool] = None

    # Section 2: Annual Revenue
    rev_100k: Optional[bool] = None
    rev_250k: Optional[bool] = None
    rev_1m: Optional[bool] = None
    rev_5m: Optional[bool] = None
    rev_10m: Optional[bool] = None
    rev_above_10m: Optional[bool] = None

    # Section 2: Market Reach
    market_local: Optional[bool] = None
    market_national: Optional[bool] = None
    market_international: Optional[bool] = None

    # Section 3: Current Systems
    sys_paper: Optional[bool] = None
    sys_account: Optional[bool] = None
    sys_crm: Optional[bool] = None
    sys_hrm: Optional[bool] = None
    sys_inv: Optional[bool] = None
    sys_erp: Optional[bool] = None
    sys_other_chk: Optional[bool] = None
    sys_other: Optional[str] = None

    # Section 4: Key Business Priorities
    key_cust: Optional[bool] = None
    key_proposal: Optional[bool] = None
    key_suppliers: Optional[bool] = None
    key_inventory: Optional[bool] = None
    key_financial: Optional[bool] = None
    key_employees: Optional[bool] = None
    key_projects: Optional[bool] = None
    key_dms: Optional[bool] = None
    key_reports: Optional[bool] = None
    key_integration: Optional[bool] = None
    key_multicurrency: Optional[bool] = None
    key_errors: Optional[bool] = None
    key_costs: Optional[bool] = None
    key_other_chk: Optional[bool] = None
    key_other: Optional[str] = None

    # Section 5: Main Business Challenges
    main_manual: Optional[bool] = None
    main_delay: Optional[bool] = None
    main_tracking: Optional[bool] = None
    main_payments: Optional[bool] = None
    main_suppliers: Optional[bool] = None
    main_inventory: Optional[bool] = None
    main_hr: Optional[bool] = None
    main_reports: Optional[bool] = None
    main_currency: Optional[bool] = None
    main_branches: Optional[bool] = None
    main_emp: Optional[bool] = None
    main_lack: Optional[bool] = None
    main_diff: Optional[bool] = None
    main_branch: Optional[bool] = None
    main_other_chk: Optional[bool] = None
    main_other: Optional[str] = None

    # Section 6: Other Requirements
    other_notes: Optional[str] = None

    submit_status: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Meeting Calendar Form ==============

class CRMeetingCalendarCreate(BaseModel):
    # General Information (read-only, populated from customer requirement)
    gi_name: Optional[str] = None
    gi_company: Optional[str] = None
    gi_address: Optional[str] = None
    gi_country: Optional[int] = None
    gi_province: Optional[int] = None
    gi_city: Optional[int] = None
    gi_postal: Optional[str] = None
    gi_phone: Optional[str] = None
    gi_ext: Optional[str] = None
    gi_fax: Optional[str] = None
    gi_email: Optional[str] = None
    gi_website: Optional[str] = None
    gi_branch_office: Optional[str] = None
    gi_branch_address: Optional[str] = None

    # Arrange Meeting Session
    prefered_date: Optional[date] = None
    prefered_time: Optional[str] = None
    gi_remark: Optional[str] = None
    timezone: Optional[int] = None

    # Second meeting slot
    prefered_date2: Optional[date] = None
    prefered_time2: Optional[str] = None
    gi_remark2: Optional[str] = None
    timezone2: Optional[int] = None

    submit_status: Optional[int] = 1


class CRMeetingCalendarUpdate(CRMeetingCalendarCreate):
    pass


class CRMeetingCalendarResponse(BaseModel):
    id: int
    customer_requirement_id: int

    # General Information
    gi_name: Optional[str] = None
    gi_company: Optional[str] = None
    gi_address: Optional[str] = None
    gi_country: Optional[int] = None
    gi_province: Optional[int] = None
    gi_city: Optional[int] = None
    gi_postal: Optional[str] = None
    gi_phone: Optional[str] = None
    gi_ext: Optional[str] = None
    gi_fax: Optional[str] = None
    gi_email: Optional[str] = None
    gi_website: Optional[str] = None
    gi_branch_office: Optional[str] = None
    gi_branch_address: Optional[str] = None

    # Arrange Meeting Session
    prefered_date: Optional[date] = None
    prefered_time: Optional[str] = None
    gi_remark: Optional[str] = None
    timezone: Optional[int] = None

    # Second meeting slot
    prefered_date2: Optional[date] = None
    prefered_time2: Optional[str] = None
    gi_remark2: Optional[str] = None
    timezone2: Optional[int] = None

    submit_status: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== Presentation Meeting Schemas ==============

class CRPresentationMeetingCreate(BaseModel):
    customer_requirement_id: Optional[int] = None

    # General Information
    gi_name: Optional[str] = None
    gi_company: Optional[str] = None
    gi_address: Optional[str] = None
    gi_country: Optional[int] = None
    gi_province: Optional[int] = None
    gi_city: Optional[int] = None
    gi_postal: Optional[str] = None
    gi_phone: Optional[str] = None
    gi_ext: Optional[str] = None
    gi_fax: Optional[str] = None
    gi_email: Optional[str] = None
    gi_website: Optional[str] = None
    gi_branch_office: Optional[str] = None
    gi_branch_address: Optional[str] = None

    # Arrange Demo Session
    prefered_date: Optional[date] = None
    prefered_time: Optional[str] = None
    gi_remark: Optional[str] = None
    timezone: Optional[int] = None

    submit_status: Optional[int] = None


class CRPresentationMeetingUpdate(CRPresentationMeetingCreate):
    pass


class CRPresentationMeetingResponse(BaseModel):
    id: int
    customer_requirement_id: int

    # General Information
    gi_name: Optional[str] = None
    gi_company: Optional[str] = None
    gi_address: Optional[str] = None
    gi_country: Optional[int] = None
    gi_province: Optional[int] = None
    gi_city: Optional[int] = None
    gi_postal: Optional[str] = None
    gi_phone: Optional[str] = None
    gi_ext: Optional[str] = None
    gi_fax: Optional[str] = None
    gi_email: Optional[str] = None
    gi_website: Optional[str] = None
    gi_branch_office: Optional[str] = None
    gi_branch_address: Optional[str] = None

    # Arrange Demo Session
    prefered_date: Optional[date] = None
    prefered_time: Optional[str] = None
    gi_remark: Optional[str] = None
    timezone: Optional[int] = None

    submit_status: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

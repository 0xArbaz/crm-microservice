from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CustomerRequirement(Base):
    """Main customer requirement record linked to a lead"""
    __tablename__ = "customer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)

    # Customer Details
    company_name = Column(String(255), nullable=True)
    address_line1 = Column(String(500), nullable=True)
    address_line2 = Column(String(500), nullable=True)
    country_id = Column(Integer, nullable=True)
    state_id = Column(Integer, nullable=True)
    city_id = Column(Integer, nullable=True)
    zip_code = Column(String(50), nullable=True)
    phone_no = Column(String(50), nullable=True)
    phone_ext = Column(String(20), nullable=True)
    fax = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)

    # Contact Information
    contact_name = Column(String(255), nullable=True)
    contact_title = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_ext = Column(String(20), nullable=True)
    contact_email = Column(String(255), nullable=True)
    best_time_call = Column(String(50), nullable=True)
    mode = Column(String(100), nullable=True)

    # Business Details
    branch_office = Column(String(255), nullable=True)
    no_of_employees = Column(Integer, nullable=True)
    instance_required = Column(String(100), nullable=True)
    ecommerce = Column(Boolean, default=False)

    # Additional Info
    group_id = Column(Integer, nullable=True)
    industry_id = Column(Integer, nullable=True)
    region_id = Column(Integer, nullable=True)
    timezone_id = Column(Integer, nullable=True)
    sales_rep_id = Column(Integer, nullable=True)
    lead_source_id = Column(Integer, nullable=True)
    lead_from_id = Column(Integer, nullable=True)
    lead_from_name = Column(String(255), nullable=True)
    lead_score = Column(String(50), nullable=True)
    remarks = Column(Text, nullable=True)
    office_timing_from = Column(String(20), nullable=True)
    office_timing_to = Column(String(20), nullable=True)

    # Qualified Lead Info
    need_type = Column(String(100), nullable=True)
    budget = Column(String(100), nullable=True)
    time_frame = Column(String(100), nullable=True)
    current_it_infrastructure = Column(Text, nullable=True)
    current_software = Column(String(255), nullable=True)
    need_summary = Column(Text, nullable=True)
    decision_maker = Column(String(255), nullable=True)
    qualified_by = Column(String(255), nullable=True)

    # Company Profile Section
    company_profile = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)

    # Status
    current_tab = Column(String(50), default='customer_details')
    status = Column(String(50), default='active')

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    # Relationship
    lead = relationship("Lead", backref="customer_requirements")


class CRIntroduction(Base):
    """Introduction tab data"""
    __tablename__ = "cr_introductions"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    contact_ids = Column(Text, nullable=True)  # JSON array of contact IDs
    email_format = Column(String(100), nullable=True)
    email_content = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRRequirement(Base):
    """Requirement tab data"""
    __tablename__ = "cr_requirements"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    # Software Requirements
    software_type = Column(String(100), nullable=True)
    modules_required = Column(Text, nullable=True)  # JSON array

    # E-Commerce Requirements
    ecommerce_required = Column(Boolean, default=False)
    ecommerce_modules = Column(Text, nullable=True)  # JSON array

    # Analysis
    business_analysis = Column(Text, nullable=True)
    functional_analysis = Column(Text, nullable=True)
    software_analysis = Column(Text, nullable=True)

    # Process Flow
    process_flow_diagram = Column(Text, nullable=True)
    process_flow_notes = Column(Text, nullable=True)

    # Status
    status = Column(String(50), default='pending')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRPresentation(Base):
    """Presentation tab data"""
    __tablename__ = "cr_presentations"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    presentation_date = Column(Date, nullable=True)
    presentation_time = Column(String(50), nullable=True)
    presenter_id = Column(Integer, nullable=True)
    attendees = Column(Text, nullable=True)  # JSON array of contact IDs
    location = Column(String(255), nullable=True)
    meeting_link = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default='scheduled')
    presentation_modules = Column(Text, nullable=True)  # JSON object of module checkboxes

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRDemo(Base):
    """Demo tab data"""
    __tablename__ = "cr_demos"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    demo_date = Column(Date, nullable=True)
    demo_time = Column(String(50), nullable=True)
    demo_type = Column(String(100), nullable=True)
    presenter_id = Column(Integer, nullable=True)
    attendees = Column(Text, nullable=True)  # JSON array
    location = Column(String(255), nullable=True)
    meeting_link = Column(String(500), nullable=True)
    modules_to_demo = Column(Text, nullable=True)  # JSON array
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(String(50), default='scheduled')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRProposal(Base):
    """Proposal tab data"""
    __tablename__ = "cr_proposals"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    proposal_number = Column(String(100), nullable=True)
    proposal_date = Column(Date, nullable=True)
    valid_until = Column(Date, nullable=True)

    # Pricing
    subtotal = Column(Float, default=0)
    discount = Column(Float, default=0)
    tax = Column(Float, default=0)
    total = Column(Float, default=0)
    currency = Column(String(10), default='USD')

    # Content
    purpose = Column(Text, nullable=True)
    scope = Column(Text, nullable=True)
    deliverables = Column(Text, nullable=True)
    terms_conditions = Column(Text, nullable=True)

    status = Column(String(50), default='draft')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRAgreement(Base):
    """Agreement tab data"""
    __tablename__ = "cr_agreements"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    agreement_number = Column(String(100), nullable=True)
    agreement_date = Column(Date, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    agreement_type = Column(String(100), nullable=True)
    agreement_value = Column(Float, default=0)
    currency = Column(String(10), default='USD')

    terms = Column(Text, nullable=True)
    special_conditions = Column(Text, nullable=True)

    signed_by_customer = Column(Boolean, default=False)
    signed_by_company = Column(Boolean, default=False)
    customer_signatory = Column(String(255), nullable=True)
    company_signatory = Column(String(255), nullable=True)

    status = Column(String(50), default='draft')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRInitiation(Base):
    """Initiation tab data"""
    __tablename__ = "cr_initiations"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    project_name = Column(String(255), nullable=True)
    project_code = Column(String(100), nullable=True)
    kickoff_date = Column(Date, nullable=True)

    project_manager_id = Column(Integer, nullable=True)
    team_members = Column(Text, nullable=True)  # JSON array

    objectives = Column(Text, nullable=True)
    scope_statement = Column(Text, nullable=True)
    assumptions = Column(Text, nullable=True)
    constraints = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)

    status = Column(String(50), default='pending')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRPlanning(Base):
    """Planning tab data"""
    __tablename__ = "cr_plannings"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    planned_start_date = Column(Date, nullable=True)
    planned_end_date = Column(Date, nullable=True)
    actual_start_date = Column(Date, nullable=True)
    actual_end_date = Column(Date, nullable=True)

    milestones = Column(Text, nullable=True)  # JSON array
    resources = Column(Text, nullable=True)  # JSON array
    budget = Column(Float, default=0)

    work_breakdown = Column(Text, nullable=True)
    schedule = Column(Text, nullable=True)
    risk_plan = Column(Text, nullable=True)
    communication_plan = Column(Text, nullable=True)

    status = Column(String(50), default='planning')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRConfiguration(Base):
    """Configuration tab data"""
    __tablename__ = "cr_configurations"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    instance_name = Column(String(255), nullable=True)
    instance_url = Column(String(500), nullable=True)
    environment = Column(String(50), nullable=True)  # development, staging, production

    modules_configured = Column(Text, nullable=True)  # JSON array
    settings = Column(Text, nullable=True)  # JSON object
    customizations = Column(Text, nullable=True)
    integrations = Column(Text, nullable=True)

    configured_by = Column(Integer, nullable=True)
    configuration_date = Column(Date, nullable=True)

    status = Column(String(50), default='pending')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRTraining(Base):
    """Training tab data"""
    __tablename__ = "cr_trainings"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    training_type = Column(String(100), nullable=True)
    training_date = Column(Date, nullable=True)
    training_time = Column(String(50), nullable=True)
    duration_hours = Column(Float, nullable=True)

    trainer_id = Column(Integer, nullable=True)
    trainees = Column(Text, nullable=True)  # JSON array

    topics_covered = Column(Text, nullable=True)
    materials = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)

    status = Column(String(50), default='scheduled')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRUAT(Base):
    """UAT (User Acceptance Testing) tab data"""
    __tablename__ = "cr_uats"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    uat_start_date = Column(Date, nullable=True)
    uat_end_date = Column(Date, nullable=True)

    test_scenarios = Column(Text, nullable=True)  # JSON array
    test_cases = Column(Text, nullable=True)  # JSON array
    testers = Column(Text, nullable=True)  # JSON array

    issues_found = Column(Text, nullable=True)
    issues_resolved = Column(Text, nullable=True)

    sign_off_date = Column(Date, nullable=True)
    signed_off_by = Column(String(255), nullable=True)

    status = Column(String(50), default='pending')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRDataMigration(Base):
    """Data Migration tab data"""
    __tablename__ = "cr_data_migrations"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    migration_date = Column(Date, nullable=True)
    source_system = Column(String(255), nullable=True)
    target_system = Column(String(255), nullable=True)

    data_mapping = Column(Text, nullable=True)  # JSON object
    migration_scripts = Column(Text, nullable=True)

    records_migrated = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)

    validation_results = Column(Text, nullable=True)
    rollback_plan = Column(Text, nullable=True)

    migrated_by = Column(Integer, nullable=True)
    verified_by = Column(Integer, nullable=True)

    status = Column(String(50), default='pending')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRGoLive(Base):
    """Go Live tab data"""
    __tablename__ = "cr_go_lives"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    planned_go_live_date = Column(Date, nullable=True)
    actual_go_live_date = Column(Date, nullable=True)

    checklist = Column(Text, nullable=True)  # JSON array
    pre_go_live_tasks = Column(Text, nullable=True)
    post_go_live_tasks = Column(Text, nullable=True)

    deployment_notes = Column(Text, nullable=True)
    issues_encountered = Column(Text, nullable=True)

    approved_by = Column(String(255), nullable=True)
    approval_date = Column(Date, nullable=True)

    status = Column(String(50), default='pending')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRSupport(Base):
    """Support tab data"""
    __tablename__ = "cr_supports"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    support_start_date = Column(Date, nullable=True)
    support_end_date = Column(Date, nullable=True)
    support_type = Column(String(100), nullable=True)  # standard, premium, enterprise

    sla_response_time = Column(String(50), nullable=True)
    sla_resolution_time = Column(String(50), nullable=True)

    support_hours = Column(String(100), nullable=True)
    support_channels = Column(Text, nullable=True)  # JSON array

    escalation_matrix = Column(Text, nullable=True)

    status = Column(String(50), default='active')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRCallLog(Base):
    """Call Logs tab data"""
    __tablename__ = "cr_call_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    call_date = Column(Date, nullable=True)
    call_time = Column(String(50), nullable=True)
    duration_minutes = Column(Integer, nullable=True)

    call_type = Column(String(50), nullable=True)  # inbound, outbound
    contact_id = Column(Integer, nullable=True)
    caller_id = Column(Integer, nullable=True)

    subject = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    outcome = Column(String(100), nullable=True)
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRDocument(Base):
    """Documents for any tab"""
    __tablename__ = "cr_documents"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    tab_name = Column(String(100), nullable=False)  # which tab this document belongs to
    sub_tab_name = Column(String(100), nullable=True)

    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(100), nullable=True)

    description = Column(Text, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(Integer, nullable=True)


class CRActivity(Base):
    """Activities for any tab"""
    __tablename__ = "cr_activities"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    tab_name = Column(String(100), nullable=False)  # which tab this activity belongs to

    activity_type = Column(String(50), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    contact_id = Column(Integer, nullable=True)
    assigned_to = Column(Integer, nullable=True)
    priority = Column(String(50), nullable=True)
    source = Column(String(100), nullable=True)  # Email, Phone, Meeting, Website, etc.

    start_date = Column(Date, nullable=True)
    start_time = Column(String(50), nullable=True)
    end_date = Column(Date, nullable=True)
    end_time = Column(String(50), nullable=True)

    status = Column(String(50), default='planned')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRMemo(Base):
    """Memos for any tab"""
    __tablename__ = "cr_memos"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    tab_name = Column(String(100), nullable=False)  # which tab this memo belongs to

    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRStatusHistory(Base):
    """Status history for any tab"""
    __tablename__ = "cr_status_histories"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    tab_name = Column(String(100), nullable=False)

    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)

    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    changed_by = Column(Integer, nullable=True)


class CREmailHistory(Base):
    """Email history for customer requirement tabs"""
    __tablename__ = "cr_email_histories"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    tab_name = Column(String(100), nullable=False)  # which tab this email belongs to
    template_id = Column(Integer, nullable=True)  # reference to cri_email_templates.id
    template_name = Column(String(255), nullable=True)  # template title for display

    # Email recipients
    to_email = Column(Text, nullable=False)  # comma-separated
    cc_email = Column(Text, nullable=True)
    bcc_email = Column(Text, nullable=True)
    email_name = Column(String(255), nullable=True)  # contact name

    # Email content
    subject = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)  # HTML content

    # Attachments - JSON array of document IDs or file paths
    attachment_ids = Column(Text, nullable=True)  # JSON array of cr_documents.id
    uploaded_attachments = Column(Text, nullable=True)  # JSON array of uploaded file paths

    # Status
    status = Column(String(50), default='sent')  # sent, failed, draft

    # Tracking
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, nullable=True)


class CRDiligenceShortForm(Base):
    """Pre-Demo Business Questionnaire (Diligence Short Form)"""
    __tablename__ = "cr_diligence_short_forms"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    # Section 1: General Information
    company_name = Column(String(255), nullable=True)
    key_person = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(Integer, nullable=True)  # city_id
    state = Column(Integer, nullable=True)  # state_id
    postal_code = Column(String(50), nullable=True)
    country = Column(Integer, nullable=True)  # country_id
    years_operation = Column(String(50), nullable=True)
    branch_address = Column(Text, nullable=True)

    # Section 2: About Your Business - Years in Business
    years_1_5 = Column(Boolean, default=False)
    years_6_10 = Column(Boolean, default=False)
    years_11_50 = Column(Boolean, default=False)
    years_51_100 = Column(Boolean, default=False)

    # Section 2: Company Size (Number of Employees)
    size_1_5 = Column(Boolean, default=False)
    size_6_10 = Column(Boolean, default=False)
    size_11_50 = Column(Boolean, default=False)
    size_51_100 = Column(Boolean, default=False)
    size_100_plus = Column(Boolean, default=False)

    # Section 2: Industry Type
    industry_trading = Column(Boolean, default=False)
    industry_manufacturing = Column(Boolean, default=False)
    industry_services = Column(Boolean, default=False)
    industry_distribution = Column(Boolean, default=False)
    industry_retail = Column(Boolean, default=False)
    industry_projects = Column(Boolean, default=False)
    industry_consulting = Column(Boolean, default=False)
    industry_other_chk = Column(Boolean, default=False)
    industry_other = Column(String(255), nullable=True)

    # Section 2: Legal Structure
    legal_sole = Column(Boolean, default=False)
    legal_partnership = Column(Boolean, default=False)
    legal_llc = Column(Boolean, default=False)

    # Section 2: Annual Revenue
    rev_100k = Column(Boolean, default=False)
    rev_250k = Column(Boolean, default=False)
    rev_1m = Column(Boolean, default=False)
    rev_5m = Column(Boolean, default=False)
    rev_10m = Column(Boolean, default=False)
    rev_above_10m = Column(Boolean, default=False)

    # Section 2: Market Reach
    market_local = Column(Boolean, default=False)
    market_national = Column(Boolean, default=False)
    market_international = Column(Boolean, default=False)

    # Section 3: Current Systems
    sys_paper = Column(Boolean, default=False)
    sys_account = Column(Boolean, default=False)
    sys_crm = Column(Boolean, default=False)
    sys_hrm = Column(Boolean, default=False)
    sys_inv = Column(Boolean, default=False)
    sys_erp = Column(Boolean, default=False)
    sys_other_chk = Column(Boolean, default=False)
    sys_other = Column(String(255), nullable=True)

    # Section 4: Key Business Priorities
    key_cust = Column(Boolean, default=False)
    key_proposal = Column(Boolean, default=False)
    key_suppliers = Column(Boolean, default=False)
    key_inventory = Column(Boolean, default=False)
    key_financial = Column(Boolean, default=False)
    key_employees = Column(Boolean, default=False)
    key_projects = Column(Boolean, default=False)
    key_dms = Column(Boolean, default=False)
    key_reports = Column(Boolean, default=False)
    key_integration = Column(Boolean, default=False)
    key_multicurrency = Column(Boolean, default=False)
    key_errors = Column(Boolean, default=False)
    key_costs = Column(Boolean, default=False)
    key_other_chk = Column(Boolean, default=False)
    key_other = Column(String(255), nullable=True)

    # Section 5: Main Business Challenges
    main_manual = Column(Boolean, default=False)
    main_delay = Column(Boolean, default=False)
    main_tracking = Column(Boolean, default=False)
    main_payments = Column(Boolean, default=False)
    main_suppliers = Column(Boolean, default=False)
    main_inventory = Column(Boolean, default=False)
    main_hr = Column(Boolean, default=False)
    main_reports = Column(Boolean, default=False)
    main_currency = Column(Boolean, default=False)
    main_branches = Column(Boolean, default=False)
    main_emp = Column(Boolean, default=False)
    main_lack = Column(Boolean, default=False)
    main_diff = Column(Boolean, default=False)
    main_branch = Column(Boolean, default=False)
    main_other_chk = Column(Boolean, default=False)
    main_other = Column(String(255), nullable=True)

    # Section 6: Other Requirements
    other_notes = Column(Text, nullable=True)

    # Status
    submit_status = Column(Integer, default=1)  # 1=draft, 2=submitted

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRMeetingCalendar(Base):
    """Meeting Calendar Form - for scheduling meetings/demos"""
    __tablename__ = "cr_meeting_calendars"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    # General Information (read-only, populated from customer requirement)
    gi_name = Column(String(255), nullable=True)  # Key Person's Name
    gi_company = Column(String(255), nullable=True)  # Company Name
    gi_address = Column(Text, nullable=True)  # Address
    gi_country = Column(Integer, nullable=True)  # Country ID
    gi_province = Column(Integer, nullable=True)  # State/Province ID
    gi_city = Column(Integer, nullable=True)  # City ID
    gi_postal = Column(String(50), nullable=True)  # Postal Code
    gi_phone = Column(String(100), nullable=True)  # Company Phone
    gi_ext = Column(String(20), nullable=True)  # Phone Extension
    gi_fax = Column(String(100), nullable=True)  # Fax
    gi_email = Column(String(255), nullable=True)  # Email
    gi_website = Column(String(255), nullable=True)  # Website
    gi_branch_office = Column(String(255), nullable=True)  # Any Branch Office
    gi_branch_address = Column(Text, nullable=True)  # Branch Address

    # Arrange Meeting Session
    prefered_date = Column(Date, nullable=True)  # Preferred Date (for presentation)
    prefered_time = Column(String(50), nullable=True)  # Preferred Time (for presentation)
    gi_remark = Column(Text, nullable=True)  # Remark (for presentation)
    timezone = Column(Integer, nullable=True)  # Timezone ID (for presentation)

    # Second meeting slot (for demo/additional session)
    prefered_date2 = Column(Date, nullable=True)  # Preferred Date 2
    prefered_time2 = Column(String(50), nullable=True)  # Preferred Time 2
    gi_remark2 = Column(Text, nullable=True)  # Remark 2
    timezone2 = Column(Integer, nullable=True)  # Timezone ID 2

    # Status
    submit_status = Column(Integer, default=1)  # 1=draft, 2=submitted

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class CRPresentationMeeting(Base):
    """Presentation/Demo Meeting Form - for scheduling presentation demos"""
    __tablename__ = "cr_presentation_meetings"

    id = Column(Integer, primary_key=True, index=True)
    customer_requirement_id = Column(Integer, ForeignKey("customer_requirements.id"), nullable=False, index=True)

    # General Information (read-only, populated from customer requirement)
    gi_name = Column(String(255), nullable=True)  # Key Person's Name
    gi_company = Column(String(255), nullable=True)  # Company Name
    gi_address = Column(Text, nullable=True)  # Address
    gi_country = Column(Integer, nullable=True)  # Country ID
    gi_province = Column(Integer, nullable=True)  # State/Province ID
    gi_city = Column(Integer, nullable=True)  # City ID
    gi_postal = Column(String(50), nullable=True)  # Postal Code
    gi_phone = Column(String(100), nullable=True)  # Company Phone
    gi_ext = Column(String(20), nullable=True)  # Phone Extension
    gi_fax = Column(String(100), nullable=True)  # Fax
    gi_email = Column(String(255), nullable=True)  # Email
    gi_website = Column(String(255), nullable=True)  # Website
    gi_branch_office = Column(String(255), nullable=True)  # Any Branch Office
    gi_branch_address = Column(Text, nullable=True)  # Branch Address

    # Arrange Demo Session
    prefered_date = Column(Date, nullable=True)  # Preferred Date
    prefered_time = Column(String(50), nullable=True)  # Preferred Time
    gi_remark = Column(Text, nullable=True)  # Remark
    timezone = Column(Integer, nullable=True)  # Timezone ID

    # Status
    submit_status = Column(Integer, default=1)  # 1=draft, 2=submitted

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)


class BulkEmailDoc(Base):
    """Documents for bulk email attachments"""
    __tablename__ = "bulk_email_docs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    size = Column(Integer, default=0)
    url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, nullable=True)

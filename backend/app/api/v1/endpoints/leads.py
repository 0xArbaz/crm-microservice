from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead, LeadStatus, LeadSource, LeadPriority
from app.models.customer import Customer, CustomerType
from app.models.contact import Contact
from app.schemas.lead import (
    LeadCreate, LeadUpdate, LeadResponse,
    LeadListResponse, LeadConvert, LeadDiscard
)
from app.core.permissions import check_permission

router = APIRouter()


@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new lead"""
    if not check_permission(current_user.role, "leads", "create"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = Lead(**lead_data.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead


@router.get("/", response_model=LeadListResponse)
def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[LeadStatus] = None,
    source: Optional[LeadSource] = None,
    priority: Optional[LeadPriority] = None,
    assigned_to: Optional[int] = None,
    pipeline_stage: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List leads with filtering and pagination"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(Lead)

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Lead.first_name.ilike(search_term),
                Lead.last_name.ilike(search_term),
                Lead.email.ilike(search_term),
                Lead.phone.ilike(search_term),
                Lead.company_name.ilike(search_term)
            )
        )

    if status:
        query = query.filter(Lead.status == status)

    if source:
        query = query.filter(Lead.source == source)

    if priority:
        query = query.filter(Lead.priority == priority)

    if assigned_to:
        query = query.filter(Lead.assigned_to == assigned_to)

    if pipeline_stage:
        query = query.filter(Lead.pipeline_stage == pipeline_stage)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    leads = query.order_by(Lead.created_at.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return LeadListResponse(
        items=leads,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific lead"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a lead"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.is_converted:
        raise HTTPException(status_code=400, detail="Cannot update converted lead")

    for field, value in lead_data.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)

    # TODO: If status changed, trigger webhook

    return lead


@router.post("/{lead_id}/convert", response_model=dict)
def convert_lead(
    lead_id: int,
    convert_data: LeadConvert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert lead to customer"""
    if not check_permission(current_user.role, "leads", "convert"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.is_converted:
        raise HTTPException(status_code=400, detail="Lead already converted")

    if lead.status == LeadStatus.LOST:
        raise HTTPException(status_code=400, detail="Cannot convert lost lead")

    # Generate customer code if not provided
    customer_code = convert_data.customer_code
    if not customer_code:
        # Generate code like CUS-YYYYMM-XXXX
        count = db.query(Customer).count() + 1
        customer_code = f"CUS-{datetime.utcnow().strftime('%Y%m')}-{count:04d}"

    # Map customer type
    customer_type_mapping = {
        "individual": CustomerType.INDIVIDUAL,
        "business": CustomerType.BUSINESS,
        "enterprise": CustomerType.ENTERPRISE,
        "government": CustomerType.GOVERNMENT
    }

    # Create customer from lead
    customer = Customer(
        customer_code=customer_code,
        first_name=lead.first_name,
        last_name=lead.last_name,
        email=lead.email,
        phone=lead.phone,
        alternate_phone=lead.alternate_phone,
        company_name=lead.company_name,
        designation=lead.designation,
        company_size=lead.company_size,
        industry=lead.industry,
        website=lead.website,
        customer_type=customer_type_mapping.get(convert_data.customer_type, CustomerType.BUSINESS),
        credit_limit=convert_data.credit_limit,
        billing_address=convert_data.billing_address or lead.address,
        billing_city=lead.city,
        billing_state=lead.state,
        billing_country=lead.country,
        billing_pincode=lead.pincode,
        shipping_address=convert_data.shipping_address,
        notes=f"Converted from Lead #{lead.id}. {convert_data.notes or ''}".strip(),
        account_manager=lead.assigned_to,
        lead_id=lead.id,
        total_revenue=lead.actual_value or 0
    )

    db.add(customer)
    db.flush()  # Get customer ID

    # Update lead
    lead.status = LeadStatus.WON
    lead.is_converted = True
    lead.converted_customer_id = customer.id
    lead.converted_at = datetime.utcnow()

    # Transfer contacts from lead to customer
    lead_contacts = db.query(Contact).filter(Contact.lead_id == lead.id).all()
    for contact in lead_contacts:
        contact.customer_id = customer.id

    db.commit()
    db.refresh(customer)

    # TODO: Trigger outgoing webhook for lead_converted event
    # TODO: Sync customer to ERP

    return {
        "message": "Lead converted to customer",
        "customer_id": customer.id,
        "customer_code": customer.customer_code
    }


@router.post("/{lead_id}/discard", response_model=LeadResponse)
def discard_lead(
    lead_id: int,
    discard_data: LeadDiscard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark lead as lost"""
    if not check_permission(current_user.role, "leads", "discard"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.is_converted:
        raise HTTPException(status_code=400, detail="Cannot discard converted lead")

    lead.status = LeadStatus.LOST
    lead.loss_reason = discard_data.loss_reason

    db.commit()
    db.refresh(lead)

    return lead


@router.put("/{lead_id}/stage", response_model=LeadResponse)
def update_lead_stage(
    lead_id: int,
    stage: int = Query(..., ge=1, le=6),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update lead pipeline stage"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.pipeline_stage = stage

    # Auto-update status based on stage
    stage_status_mapping = {
        1: LeadStatus.NEW,
        2: LeadStatus.CONTACTED,
        3: LeadStatus.QUALIFIED,
        4: LeadStatus.PROPOSAL_SENT,
        5: LeadStatus.NEGOTIATION,
        6: LeadStatus.WON
    }
    lead.status = stage_status_mapping.get(stage, lead.status)

    db.commit()
    db.refresh(lead)

    return lead


@router.delete("/{lead_id}")
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a lead (Admin only)"""
    if not check_permission(current_user.role, "leads", "delete"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(lead)
    db.commit()

    return {"message": "Lead deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.pre_lead import PreLead, PreLeadStatus, PreLeadSource
from app.models.lead import Lead, LeadSource
from app.schemas.pre_lead import (
    PreLeadCreate, PreLeadUpdate, PreLeadResponse,
    PreLeadListResponse, PreLeadValidate, PreLeadDiscard
)
from app.core.permissions import check_permission

router = APIRouter()


@router.post("/", response_model=PreLeadResponse, status_code=status.HTTP_201_CREATED)
def create_pre_lead(
    pre_lead_data: PreLeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "create"):
        raise HTTPException(status_code=403, detail="Permission denied")

    pre_lead = PreLead(**pre_lead_data.model_dump())
    db.add(pre_lead)
    db.commit()
    db.refresh(pre_lead)

    return pre_lead


@router.get("/", response_model=PreLeadListResponse)
def list_pre_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[PreLeadStatus] = None,
    source: Optional[PreLeadSource] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List pre-leads with filtering and pagination"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(PreLead)

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                PreLead.first_name.ilike(search_term),
                PreLead.last_name.ilike(search_term),
                PreLead.email.ilike(search_term),
                PreLead.phone.ilike(search_term),
                PreLead.company_name.ilike(search_term)
            )
        )

    if status:
        query = query.filter(PreLead.status == status)

    if source:
        query = query.filter(PreLead.source == source)

    if assigned_to:
        query = query.filter(PreLead.assigned_to == assigned_to)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    pre_leads = query.order_by(PreLead.created_at.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return PreLeadListResponse(
        items=pre_leads,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{pre_lead_id}", response_model=PreLeadResponse)
def get_pre_lead(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    return pre_lead


@router.put("/{pre_lead_id}", response_model=PreLeadResponse)
def update_pre_lead(
    pre_lead_id: int,
    pre_lead_data: PreLeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    if pre_lead.is_converted:
        raise HTTPException(status_code=400, detail="Cannot update converted pre-lead")

    for field, value in pre_lead_data.model_dump(exclude_unset=True).items():
        setattr(pre_lead, field, value)

    db.commit()
    db.refresh(pre_lead)

    return pre_lead


@router.post("/{pre_lead_id}/validate", response_model=dict)
def validate_pre_lead(
    pre_lead_id: int,
    validate_data: PreLeadValidate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate and convert pre-lead to lead"""
    if not check_permission(current_user.role, "pre_leads", "validate"):
        raise HTTPException(status_code=403, detail="Permission denied")

    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    if pre_lead.is_converted:
        raise HTTPException(status_code=400, detail="Pre-lead already converted")

    if pre_lead.status == PreLeadStatus.DISCARDED:
        raise HTTPException(status_code=400, detail="Cannot validate discarded pre-lead")

    # Map PreLeadSource to LeadSource
    source_mapping = {
        PreLeadSource.WEBSITE: LeadSource.WEBSITE,
        PreLeadSource.REFERRAL: LeadSource.REFERRAL,
        PreLeadSource.SOCIAL_MEDIA: LeadSource.SOCIAL_MEDIA,
        PreLeadSource.COLD_CALL: LeadSource.COLD_CALL,
        PreLeadSource.WALK_IN: LeadSource.WALK_IN,
        PreLeadSource.WHATSAPP: LeadSource.WHATSAPP,
        PreLeadSource.EMAIL: LeadSource.EMAIL,
        PreLeadSource.ERP: LeadSource.ERP,
        PreLeadSource.OTHER: LeadSource.OTHER,
    }

    # Create lead from pre-lead
    lead = Lead(
        first_name=pre_lead.first_name,
        last_name=pre_lead.last_name,
        email=pre_lead.email,
        phone=pre_lead.phone,
        alternate_phone=pre_lead.alternate_phone,
        company_name=pre_lead.company_name,
        designation=pre_lead.designation,
        website=pre_lead.website,
        source=LeadSource.PRE_LEAD,
        source_details=f"Pre-Lead #{pre_lead.id} - {pre_lead.source.value}",
        product_interest=pre_lead.product_interest,
        requirements=pre_lead.requirements,
        city=pre_lead.city,
        state=pre_lead.state,
        country=pre_lead.country,
        notes=f"Converted from Pre-Lead. {validate_data.notes or ''}".strip(),
        assigned_to=pre_lead.assigned_to,
        pre_lead_id=pre_lead.id,
        expected_value=validate_data.expected_value
    )

    # Set priority based on validate_data
    from app.models.lead import LeadPriority
    priority_mapping = {
        "low": LeadPriority.LOW,
        "medium": LeadPriority.MEDIUM,
        "high": LeadPriority.HIGH,
        "critical": LeadPriority.CRITICAL
    }
    lead.priority = priority_mapping.get(validate_data.priority, LeadPriority.MEDIUM)

    db.add(lead)
    db.flush()  # Get lead ID

    # Update pre-lead
    pre_lead.status = PreLeadStatus.VALIDATED
    pre_lead.is_converted = True
    pre_lead.converted_lead_id = lead.id
    pre_lead.converted_at = datetime.utcnow()

    db.commit()
    db.refresh(lead)

    # TODO: Trigger outgoing webhook for lead_validated event

    return {
        "message": "Pre-lead validated and converted to lead",
        "lead_id": lead.id
    }


@router.post("/{pre_lead_id}/discard", response_model=PreLeadResponse)
def discard_pre_lead(
    pre_lead_id: int,
    discard_data: PreLeadDiscard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Discard a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "discard"):
        raise HTTPException(status_code=403, detail="Permission denied")

    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    if pre_lead.is_converted:
        raise HTTPException(status_code=400, detail="Cannot discard converted pre-lead")

    pre_lead.status = PreLeadStatus.DISCARDED
    pre_lead.discard_reason = discard_data.discard_reason

    db.commit()
    db.refresh(pre_lead)

    return pre_lead


@router.delete("/{pre_lead_id}")
def delete_pre_lead(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a pre-lead (Admin only)"""
    if not check_permission(current_user.role, "pre_leads", "delete"):
        raise HTTPException(status_code=403, detail="Permission denied")

    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    db.delete(pre_lead)
    db.commit()

    return {"message": "Pre-lead deleted successfully"}

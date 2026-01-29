from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import os
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.pre_lead import PreLead
from app.models.pre_lead_contact import PreLeadContact
from app.models.pre_lead_activity import PreLeadActivity
from app.models.pre_lead_memo import PreLeadMemo
from app.models.pre_lead_document import PreLeadDocument
from app.models.pre_lead_status_history import PreLeadStatusHistory
from app.models.qualified_lead_profile import QualifiedLeadProfile
from app.schemas.pre_lead_entities import (
    PreLeadContactCreate, PreLeadContactUpdate, PreLeadContactResponse,
    PreLeadActivityCreate, PreLeadActivityUpdate, PreLeadActivityResponse,
    PreLeadMemoCreate, PreLeadMemoUpdate, PreLeadMemoResponse,
    PreLeadDocumentResponse,
    PreLeadStatusHistoryCreate, PreLeadStatusHistoryResponse,
    QualifiedLeadProfileCreate, QualifiedLeadProfileUpdate, QualifiedLeadProfileResponse,
    PreLeadFullResponse
)
from app.core.permissions import check_permission

router = APIRouter()

# Upload directory for documents
UPLOAD_DIR = "uploads/pre_leads"


# ============== Full Pre-Lead with all entities ==============

@router.get("/{pre_lead_id}/full", response_model=PreLeadFullResponse)
def get_pre_lead_full(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pre-lead with all related entities"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    # Get related entities
    contacts = db.query(PreLeadContact).filter(PreLeadContact.pre_lead_id == pre_lead_id).all()
    activities = db.query(PreLeadActivity).filter(PreLeadActivity.pre_lead_id == pre_lead_id).order_by(PreLeadActivity.created_at.desc()).all()
    memos = db.query(PreLeadMemo).filter(PreLeadMemo.pre_lead_id == pre_lead_id).order_by(PreLeadMemo.created_at.desc()).all()
    documents = db.query(PreLeadDocument).filter(PreLeadDocument.pre_lead_id == pre_lead_id).all()
    status_history = db.query(PreLeadStatusHistory).filter(PreLeadStatusHistory.pre_lead_id == pre_lead_id).order_by(PreLeadStatusHistory.created_at.desc()).all()
    qualified_profiles = db.query(QualifiedLeadProfile).filter(QualifiedLeadProfile.pre_lead_id == pre_lead_id).all()

    return PreLeadFullResponse(
        id=pre_lead.id,
        first_name=pre_lead.first_name,
        last_name=pre_lead.last_name,
        email=pre_lead.email,
        phone=pre_lead.phone,
        company_name=pre_lead.company_name,
        website=pre_lead.website,
        status=pre_lead.status.value if hasattr(pre_lead.status, 'value') else str(pre_lead.status),
        source=pre_lead.source.value if hasattr(pre_lead.source, 'value') else str(pre_lead.source),
        address_line1=pre_lead.address_line1,
        address_line2=pre_lead.address_line2,
        city_id=pre_lead.city_id,
        state_id=pre_lead.state_id,
        country_id=pre_lead.country_id,
        zip_code=pre_lead.zip_code,
        phone_no=pre_lead.phone_no,
        fax=pre_lead.fax,
        nof_representative=pre_lead.nof_representative,
        group_id=pre_lead.group_id,
        industry_id=pre_lead.industry_id,
        region_id=pre_lead.region_id,
        office_timings=pre_lead.office_timings,
        timezone=pre_lead.timezone,
        sales_rep=pre_lead.sales_rep,
        lead_source=pre_lead.lead_source,
        lead_status=pre_lead.lead_status,
        lead_score=pre_lead.lead_score,
        lead_since=pre_lead.lead_since,
        remarks=pre_lead.remarks,
        memo=pre_lead.memo,
        created_at=pre_lead.created_at,
        updated_at=pre_lead.updated_at,
        contacts=contacts,
        activities=activities,
        memos=memos,
        documents=documents,
        status_history=status_history,
        qualified_profiles=qualified_profiles
    )


# ============== Contacts ==============

@router.get("/{pre_lead_id}/contacts", response_model=List[PreLeadContactResponse])
def list_contacts(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all contacts for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contacts = db.query(PreLeadContact).filter(PreLeadContact.pre_lead_id == pre_lead_id).all()
    return contacts


@router.post("/{pre_lead_id}/contacts", response_model=PreLeadContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    pre_lead_id: int,
    contact_data: PreLeadContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contact for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify pre-lead exists
    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    data = contact_data.model_dump()
    data['pre_lead_id'] = pre_lead_id
    data['created_by'] = current_user.id

    contact = PreLeadContact(**data)
    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


@router.put("/{pre_lead_id}/contacts/{contact_id}", response_model=PreLeadContactResponse)
def update_contact(
    pre_lead_id: int,
    contact_id: int,
    contact_data: PreLeadContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a contact"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contact = db.query(PreLeadContact).filter(
        PreLeadContact.id == contact_id,
        PreLeadContact.pre_lead_id == pre_lead_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    update_data = contact_data.model_dump(exclude_unset=True)
    update_data['updated_by'] = current_user.id

    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)

    return contact


@router.delete("/{pre_lead_id}/contacts/{contact_id}")
def delete_contact(
    pre_lead_id: int,
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a contact"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contact = db.query(PreLeadContact).filter(
        PreLeadContact.id == contact_id,
        PreLeadContact.pre_lead_id == pre_lead_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()

    return {"message": "Contact deleted successfully"}


# ============== Activities ==============

@router.get("/{pre_lead_id}/activities", response_model=List[PreLeadActivityResponse])
def list_activities(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all activities for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activities = db.query(PreLeadActivity).filter(
        PreLeadActivity.pre_lead_id == pre_lead_id
    ).order_by(PreLeadActivity.created_at.desc()).all()
    return activities


@router.post("/{pre_lead_id}/activities", response_model=PreLeadActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    pre_lead_id: int,
    activity_data: PreLeadActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify pre-lead exists
    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    data = activity_data.model_dump()
    data['pre_lead_id'] = pre_lead_id
    data['created_by'] = current_user.id

    activity = PreLeadActivity(**data)
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


@router.put("/{pre_lead_id}/activities/{activity_id}", response_model=PreLeadActivityResponse)
def update_activity(
    pre_lead_id: int,
    activity_id: int,
    activity_data: PreLeadActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an activity"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(PreLeadActivity).filter(
        PreLeadActivity.id == activity_id,
        PreLeadActivity.pre_lead_id == pre_lead_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = activity_data.model_dump(exclude_unset=True)
    update_data['updated_by'] = current_user.id

    for field, value in update_data.items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)

    return activity


@router.delete("/{pre_lead_id}/activities/{activity_id}")
def delete_activity(
    pre_lead_id: int,
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an activity"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(PreLeadActivity).filter(
        PreLeadActivity.id == activity_id,
        PreLeadActivity.pre_lead_id == pre_lead_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}


# ============== Memos ==============

@router.get("/{pre_lead_id}/memos", response_model=List[PreLeadMemoResponse])
def list_memos(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all memos for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    memos = db.query(PreLeadMemo).filter(
        PreLeadMemo.pre_lead_id == pre_lead_id
    ).order_by(PreLeadMemo.created_at.desc()).all()
    return memos


@router.post("/{pre_lead_id}/memos", response_model=PreLeadMemoResponse, status_code=status.HTTP_201_CREATED)
def create_memo(
    pre_lead_id: int,
    memo_data: PreLeadMemoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new memo for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify pre-lead exists
    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    data = memo_data.model_dump()
    data['pre_lead_id'] = pre_lead_id
    data['created_by'] = current_user.id

    memo = PreLeadMemo(**data)
    db.add(memo)
    db.commit()
    db.refresh(memo)

    return memo


@router.put("/{pre_lead_id}/memos/{memo_id}", response_model=PreLeadMemoResponse)
def update_memo(
    pre_lead_id: int,
    memo_id: int,
    memo_data: PreLeadMemoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a memo"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    memo = db.query(PreLeadMemo).filter(
        PreLeadMemo.id == memo_id,
        PreLeadMemo.pre_lead_id == pre_lead_id
    ).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    update_data = memo_data.model_dump(exclude_unset=True)
    update_data['updated_by'] = current_user.id

    for field, value in update_data.items():
        setattr(memo, field, value)

    db.commit()
    db.refresh(memo)

    return memo


@router.delete("/{pre_lead_id}/memos/{memo_id}")
def delete_memo(
    pre_lead_id: int,
    memo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a memo"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    memo = db.query(PreLeadMemo).filter(
        PreLeadMemo.id == memo_id,
        PreLeadMemo.pre_lead_id == pre_lead_id
    ).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    db.delete(memo)
    db.commit()

    return {"message": "Memo deleted successfully"}


# ============== Documents ==============

@router.get("/{pre_lead_id}/documents", response_model=List[PreLeadDocumentResponse])
def list_documents(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    documents = db.query(PreLeadDocument).filter(
        PreLeadDocument.pre_lead_id == pre_lead_id
    ).all()
    return documents


@router.post("/{pre_lead_id}/documents", response_model=PreLeadDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    pre_lead_id: int,
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify pre-lead exists
    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    # Create upload directory if not exists
    upload_path = f"{UPLOAD_DIR}/{pre_lead_id}"
    os.makedirs(upload_path, exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = f"{upload_path}/{unique_filename}"

    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Create document record
    document = PreLeadDocument(
        pre_lead_id=pre_lead_id,
        name=unique_filename,
        original_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        size=len(content),
        notes=notes,
        uploaded_by=current_user.id
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.delete("/{pre_lead_id}/documents/{document_id}")
def delete_document(
    pre_lead_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    document = db.query(PreLeadDocument).filter(
        PreLeadDocument.id == document_id,
        PreLeadDocument.pre_lead_id == pre_lead_id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}


# ============== Status History ==============

@router.get("/{pre_lead_id}/status-history", response_model=List[PreLeadStatusHistoryResponse])
def list_status_history(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List status history for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    history = db.query(PreLeadStatusHistory).filter(
        PreLeadStatusHistory.pre_lead_id == pre_lead_id
    ).order_by(PreLeadStatusHistory.created_at.desc()).all()
    return history


@router.post("/{pre_lead_id}/status", response_model=PreLeadStatusHistoryResponse, status_code=status.HTTP_201_CREATED)
def change_status(
    pre_lead_id: int,
    status_data: PreLeadStatusHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change pre-lead status and record history"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify pre-lead exists
    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    # Create status history record
    history = PreLeadStatusHistory(
        pre_lead_id=pre_lead_id,
        status=status_data.status,
        status_date=status_data.status_date or date.today(),
        remarks=status_data.remarks,
        updated_by=current_user.id
    )
    db.add(history)

    # Update pre-lead status
    pre_lead.lead_status = status_data.status

    db.commit()
    db.refresh(history)

    return history


# ============== Qualified Lead Profile ==============

@router.get("/{pre_lead_id}/qualified-profiles", response_model=List[QualifiedLeadProfileResponse])
def list_qualified_profiles(
    pre_lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List qualified lead profiles for a pre-lead"""
    if not check_permission(current_user.role, "pre_leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    profiles = db.query(QualifiedLeadProfile).filter(
        QualifiedLeadProfile.pre_lead_id == pre_lead_id
    ).all()
    return profiles


@router.post("/{pre_lead_id}/qualified-profiles", response_model=QualifiedLeadProfileResponse, status_code=status.HTTP_201_CREATED)
def create_qualified_profile(
    pre_lead_id: int,
    profile_data: QualifiedLeadProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a qualified lead profile"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify pre-lead exists
    pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
    if not pre_lead:
        raise HTTPException(status_code=404, detail="Pre-lead not found")

    data = profile_data.model_dump()
    data['pre_lead_id'] = pre_lead_id
    data['company_name'] = pre_lead.company_name or pre_lead.first_name
    data['industry_id'] = pre_lead.industry_id
    data['created_by'] = current_user.id

    profile = QualifiedLeadProfile(**data)
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.put("/{pre_lead_id}/qualified-profiles/{profile_id}", response_model=QualifiedLeadProfileResponse)
def update_qualified_profile(
    pre_lead_id: int,
    profile_id: int,
    profile_data: QualifiedLeadProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a qualified lead profile"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    profile = db.query(QualifiedLeadProfile).filter(
        QualifiedLeadProfile.id == profile_id,
        QualifiedLeadProfile.pre_lead_id == pre_lead_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Qualified profile not found")

    update_data = profile_data.model_dump(exclude_unset=True)
    update_data['updated_by'] = current_user.id

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete("/{pre_lead_id}/qualified-profiles/{profile_id}")
def delete_qualified_profile(
    pre_lead_id: int,
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a qualified lead profile"""
    if not check_permission(current_user.role, "pre_leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    profile = db.query(QualifiedLeadProfile).filter(
        QualifiedLeadProfile.id == profile_id,
        QualifiedLeadProfile.pre_lead_id == pre_lead_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Qualified profile not found")

    db.delete(profile)
    db.commit()

    return {"message": "Qualified profile deleted successfully"}

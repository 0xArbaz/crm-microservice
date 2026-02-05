from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import os
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead
from app.models.lead_contact import LeadContact
from app.models.lead_activity import LeadActivity
from app.models.lead_memo import LeadMemo
from app.models.lead_document import LeadDocument
from app.models.lead_status_history import LeadStatusHistory
from app.models.lead_qualified_profile import LeadQualifiedProfile
from app.schemas.lead_entities import (
    LeadContactCreate, LeadContactUpdate, LeadContactResponse,
    LeadActivityCreate, LeadActivityUpdate, LeadActivityResponse,
    LeadMemoCreate, LeadMemoUpdate, LeadMemoResponse,
    LeadDocumentResponse,
    LeadStatusHistoryCreate, LeadStatusHistoryResponse,
    LeadQualifiedProfileCreate, LeadQualifiedProfileUpdate, LeadQualifiedProfileResponse,
    LeadFullResponse
)
from app.core.permissions import check_permission

router = APIRouter()

# Upload directory for documents
UPLOAD_DIR = "uploads/leads"


# ============== Full Lead with all entities ==============

@router.get("/{lead_id}/full", response_model=LeadFullResponse)
def get_lead_full(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get lead with all related entities"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Get related entities
    contacts = db.query(LeadContact).filter(LeadContact.lead_id == lead_id).all()
    activities = db.query(LeadActivity).filter(LeadActivity.lead_id == lead_id).order_by(LeadActivity.created_at.desc()).all()
    memos = db.query(LeadMemo).filter(LeadMemo.lead_id == lead_id).order_by(LeadMemo.created_at.desc()).all()
    documents = db.query(LeadDocument).filter(LeadDocument.lead_id == lead_id).all()
    status_history = db.query(LeadStatusHistory).filter(LeadStatusHistory.lead_id == lead_id).order_by(LeadStatusHistory.created_at.desc()).all()
    qualified_profiles = db.query(LeadQualifiedProfile).filter(LeadQualifiedProfile.lead_id == lead_id).all()

    return LeadFullResponse(
        id=lead.id,
        first_name=lead.first_name,
        last_name=lead.last_name,
        email=lead.email,
        phone=lead.phone,
        company_name=lead.company_name,
        website=lead.website,
        status=lead.status.value if hasattr(lead.status, 'value') else str(lead.status),
        source=lead.source.value if hasattr(lead.source, 'value') else str(lead.source),
        priority=lead.priority.value if hasattr(lead.priority, 'value') else str(lead.priority),
        pipeline_stage=lead.pipeline_stage,
        expected_value=lead.expected_value,
        address_line1=lead.address_line1,
        address_line2=lead.address_line2,
        city_id=lead.city_id,
        state_id=lead.state_id,
        country_id=lead.country_id,
        zip_code=lead.zip_code,
        phone_no=lead.phone_no,
        fax=lead.fax,
        nof_representative=lead.nof_representative,
        group_id=lead.group_id,
        industry_id=lead.industry_id,
        region_id=lead.region_id,
        office_timings=lead.office_timings,
        timezone=lead.timezone,
        sales_rep=lead.sales_rep,
        lead_source=lead.lead_source,
        lead_score=lead.lead_score,
        lead_since=lead.lead_since,
        remarks=lead.remarks,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
        contacts=contacts,
        activities=activities,
        memos=memos,
        documents=documents,
        status_history=status_history,
        qualified_profiles=qualified_profiles
    )


# ============== Contacts ==============

@router.get("/all-contacts", response_model=List[dict])
def list_all_lead_contacts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    contact_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all contacts across all leads with lead/company information"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(LeadContact, Lead).join(Lead, LeadContact.lead_id == Lead.id)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (LeadContact.first_name.ilike(search_filter)) |
            (LeadContact.last_name.ilike(search_filter)) |
            (LeadContact.work_email.ilike(search_filter)) |
            (Lead.company_name.ilike(search_filter))
        )

    if contact_type and contact_type != 'all':
        query = query.filter(LeadContact.contact_type == contact_type)

    results = query.offset(skip).limit(limit).all()

    contacts_with_lead = []
    for contact, lead in results:
        contact_dict = {
            "id": contact.id,
            "lead_id": contact.lead_id,
            "contact_type": contact.contact_type,
            "title": contact.title,
            "first_name": contact.first_name,
            "last_name": contact.last_name,
            "designation": contact.designation,
            "department": contact.department,
            "email": contact.email,
            "work_email": contact.work_email,
            "personal_email": contact.personal_email,
            "phone": contact.phone,
            "work_phone": contact.work_phone,
            "ext": contact.ext,
            "fax": contact.fax,
            "cell_phone": contact.cell_phone,
            "home_phone": contact.home_phone,
            "linkedin_url": contact.linkedin_url,
            "facebook_url": contact.facebook_url,
            "twitter_url": contact.twitter_url,
            "status": contact.status,
            "notes": contact.notes,
            "created_at": contact.created_at,
            # Lead/Company info
            "company_name": lead.company_name,
            "industry_id": lead.industry_id,
            "group_id": lead.group_id,
        }
        contacts_with_lead.append(contact_dict)

    return contacts_with_lead


@router.get("/{lead_id}/contacts", response_model=List[LeadContactResponse])
def list_contacts(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all contacts for a lead"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contacts = db.query(LeadContact).filter(LeadContact.lead_id == lead_id).all()
    return contacts


@router.post("/{lead_id}/contacts", response_model=LeadContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    lead_id: int,
    contact_data: LeadContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contact for a lead"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    try:
        data = contact_data.model_dump(exclude_unset=False)
        data['lead_id'] = lead_id
        data['created_by'] = current_user.id

        contact = LeadContact(**data)
        db.add(contact)
        db.commit()
        db.refresh(contact)

        return contact
    except Exception as e:
        db.rollback()
        import traceback
        print(f"Error creating contact: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create contact: {str(e)}")


@router.put("/{lead_id}/contacts/{contact_id}", response_model=LeadContactResponse)
def update_contact(
    lead_id: int,
    contact_id: int,
    contact_data: LeadContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a contact"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contact = db.query(LeadContact).filter(
        LeadContact.id == contact_id,
        LeadContact.lead_id == lead_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    try:
        update_data = contact_data.model_dump(exclude_unset=True)
        update_data['updated_by'] = current_user.id

        for field, value in update_data.items():
            setattr(contact, field, value)

        db.commit()
        db.refresh(contact)

        return contact
    except Exception as e:
        db.rollback()
        import traceback
        print(f"Error updating contact: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to update contact: {str(e)}")


@router.delete("/{lead_id}/contacts/{contact_id}")
def delete_contact(
    lead_id: int,
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a contact"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contact = db.query(LeadContact).filter(
        LeadContact.id == contact_id,
        LeadContact.lead_id == lead_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()

    return {"message": "Contact deleted successfully"}


# ============== Activities ==============

@router.get("/all-activities", response_model=List[dict])
def list_all_lead_activities(
    skip: int = 0,
    limit: int = 500,
    activity_type: Optional[str] = None,
    status: Optional[str] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all activities across all leads with lead/contact information"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(LeadActivity, Lead).join(Lead, LeadActivity.lead_id == Lead.id)

    if activity_type and activity_type != 'all':
        query = query.filter(LeadActivity.activity_type == activity_type)

    if status:
        if status == 'open':
            query = query.filter(LeadActivity.is_completed == False)
        elif status == 'closed':
            query = query.filter(LeadActivity.is_completed == True)

    if assigned_to:
        query = query.filter(LeadActivity.created_by == assigned_to)

    results = query.order_by(LeadActivity.created_at.desc()).offset(skip).limit(limit).all()

    activities_with_lead = []
    for activity, lead in results:
        # Get contact name if contact_id exists
        contact_name = None
        if activity.contact_id:
            contact = db.query(LeadContact).filter(LeadContact.id == activity.contact_id).first()
            if contact:
                contact_name = f"{contact.first_name or ''} {contact.last_name or ''}".strip()

        # Get assigned user name
        assigned_to_name = None
        if activity.created_by:
            user = db.query(User).filter(User.id == activity.created_by).first()
            if user:
                assigned_to_name = user.full_name or user.email

        activity_dict = {
            "id": activity.id,
            "lead_id": activity.lead_id,
            "activity_type": activity.activity_type,
            "subject": activity.subject,
            "description": activity.description,
            "activity_date": activity.activity_date.isoformat() if activity.activity_date else None,
            "due_date": activity.due_date.isoformat() if activity.due_date else None,
            "is_completed": activity.is_completed,
            "completed_at": activity.completed_at.isoformat() if activity.completed_at else None,
            "contact_id": activity.contact_id,
            "contact_name": contact_name,
            "created_at": activity.created_at.isoformat() if activity.created_at else None,
            "created_by": activity.created_by,
            "assigned_to": assigned_to_name,
            "company_name": lead.company_name,
            "lead_status": lead.status,
        }
        activities_with_lead.append(activity_dict)

    return activities_with_lead


@router.get("/{lead_id}/activities", response_model=List[LeadActivityResponse])
def list_activities(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all activities for a lead"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activities = db.query(LeadActivity).filter(
        LeadActivity.lead_id == lead_id
    ).order_by(LeadActivity.created_at.desc()).all()
    return activities


@router.post("/{lead_id}/activities", response_model=LeadActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    lead_id: int,
    activity_data: LeadActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity for a lead"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    data = activity_data.model_dump()
    data['lead_id'] = lead_id
    data['created_by'] = current_user.id
    data['performed_by'] = current_user.id

    activity = LeadActivity(**data)
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


@router.put("/{lead_id}/activities/{activity_id}", response_model=LeadActivityResponse)
def update_activity(
    lead_id: int,
    activity_id: int,
    activity_data: LeadActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an activity"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(LeadActivity).filter(
        LeadActivity.id == activity_id,
        LeadActivity.lead_id == lead_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = activity_data.model_dump(exclude_unset=True)
    update_data['updated_by'] = current_user.id

    # If marking as completed, set completed_at
    if update_data.get('is_completed') and not activity.is_completed:
        update_data['completed_at'] = datetime.utcnow()

    for field, value in update_data.items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)

    return activity


@router.delete("/{lead_id}/activities/{activity_id}")
def delete_activity(
    lead_id: int,
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an activity"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(LeadActivity).filter(
        LeadActivity.id == activity_id,
        LeadActivity.lead_id == lead_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}


# ============== Memos ==============

@router.get("/{lead_id}/memos", response_model=List[LeadMemoResponse])
def list_memos(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all memos for a lead"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    memos = db.query(LeadMemo).filter(
        LeadMemo.lead_id == lead_id
    ).order_by(LeadMemo.created_at.desc()).all()
    return memos


@router.post("/{lead_id}/memos", response_model=LeadMemoResponse, status_code=status.HTTP_201_CREATED)
def create_memo(
    lead_id: int,
    memo_data: LeadMemoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new memo for a lead"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    data = memo_data.model_dump()
    data['lead_id'] = lead_id
    data['created_by'] = current_user.id

    memo = LeadMemo(**data)
    db.add(memo)
    db.commit()
    db.refresh(memo)

    return memo


@router.put("/{lead_id}/memos/{memo_id}", response_model=LeadMemoResponse)
def update_memo(
    lead_id: int,
    memo_id: int,
    memo_data: LeadMemoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a memo"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    memo = db.query(LeadMemo).filter(
        LeadMemo.id == memo_id,
        LeadMemo.lead_id == lead_id
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


@router.delete("/{lead_id}/memos/{memo_id}")
def delete_memo(
    lead_id: int,
    memo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a memo"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    memo = db.query(LeadMemo).filter(
        LeadMemo.id == memo_id,
        LeadMemo.lead_id == lead_id
    ).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    db.delete(memo)
    db.commit()

    return {"message": "Memo deleted successfully"}


# ============== Documents ==============

@router.get("/{lead_id}/documents", response_model=List[LeadDocumentResponse])
def list_documents(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents for a lead"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    documents = db.query(LeadDocument).filter(
        LeadDocument.lead_id == lead_id
    ).all()
    return documents


@router.post("/{lead_id}/documents", response_model=LeadDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    lead_id: int,
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for a lead"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Create upload directory if not exists
    upload_path = f"{UPLOAD_DIR}/{lead_id}"
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
    document = LeadDocument(
        lead_id=lead_id,
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


@router.delete("/{lead_id}/documents/{document_id}")
def delete_document(
    lead_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    document = db.query(LeadDocument).filter(
        LeadDocument.id == document_id,
        LeadDocument.lead_id == lead_id
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

@router.get("/{lead_id}/status-history", response_model=List[LeadStatusHistoryResponse])
def list_status_history(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List status history for a lead"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    history = db.query(LeadStatusHistory).filter(
        LeadStatusHistory.lead_id == lead_id
    ).order_by(LeadStatusHistory.created_at.desc()).all()
    return history


@router.post("/{lead_id}/status", response_model=LeadStatusHistoryResponse, status_code=status.HTTP_201_CREATED)
def change_status(
    lead_id: int,
    status_data: LeadStatusHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change lead status and record history"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Create status history record
    history = LeadStatusHistory(
        lead_id=lead_id,
        status=status_data.status,
        status_date=status_data.status_date or date.today(),
        remarks=status_data.remarks,
        updated_by=current_user.id
    )
    db.add(history)

    # Update lead status
    from app.models.lead import LeadStatus
    try:
        lead.status = LeadStatus(status_data.status)
    except ValueError:
        lead.status = status_data.status

    db.commit()
    db.refresh(history)

    return history


# ============== Qualified Lead Profile ==============

@router.get("/{lead_id}/qualified-profiles", response_model=List[LeadQualifiedProfileResponse])
def list_qualified_profiles(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List qualified lead profiles for a lead"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    profiles = db.query(LeadQualifiedProfile).filter(
        LeadQualifiedProfile.lead_id == lead_id
    ).all()
    return profiles


@router.post("/{lead_id}/qualified-profiles", response_model=LeadQualifiedProfileResponse, status_code=status.HTTP_201_CREATED)
def create_qualified_profile(
    lead_id: int,
    profile_data: LeadQualifiedProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a qualified lead profile"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    data = profile_data.model_dump()
    data['lead_id'] = lead_id
    data['company_name'] = lead.company_name or lead.first_name
    data['industry_id'] = lead.industry_id
    data['created_by'] = current_user.id

    profile = LeadQualifiedProfile(**data)
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.put("/{lead_id}/qualified-profiles/{profile_id}", response_model=LeadQualifiedProfileResponse)
def update_qualified_profile(
    lead_id: int,
    profile_id: int,
    profile_data: LeadQualifiedProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a qualified lead profile"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    profile = db.query(LeadQualifiedProfile).filter(
        LeadQualifiedProfile.id == profile_id,
        LeadQualifiedProfile.lead_id == lead_id
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


@router.delete("/{lead_id}/qualified-profiles/{profile_id}")
def delete_qualified_profile(
    lead_id: int,
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a qualified lead profile"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    profile = db.query(LeadQualifiedProfile).filter(
        LeadQualifiedProfile.id == profile_id,
        LeadQualifiedProfile.lead_id == lead_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Qualified profile not found")

    db.delete(profile)
    db.commit()

    return {"message": "Qualified profile deleted successfully"}

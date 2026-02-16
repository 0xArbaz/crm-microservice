from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead
from app.models.customer_requirement import (
    CustomerRequirement, CRIntroduction, CRRequirement, CRPresentation,
    CRDemo, CRProposal, CRAgreement, CRInitiation, CRPlanning,
    CRConfiguration, CRTraining, CRUAT, CRDataMigration, CRGoLive,
    CRSupport, CRCallLog, CRDocument, CRActivity, CRMemo, CRStatusHistory,
    CREmailHistory, CRDiligenceShortForm, CRMeetingCalendar
)
from app.schemas.customer_requirement import (
    CustomerRequirementCreate, CustomerRequirementUpdate, CustomerRequirementResponse,
    CRIntroductionCreate, CRIntroductionUpdate, CRIntroductionResponse,
    CRRequirementCreate, CRRequirementUpdate, CRRequirementResponse,
    CRPresentationCreate, CRPresentationUpdate, CRPresentationResponse,
    CRDemoCreate, CRDemoUpdate, CRDemoResponse,
    CRProposalCreate, CRProposalUpdate, CRProposalResponse,
    CRAgreementCreate, CRAgreementUpdate, CRAgreementResponse,
    CRDocumentCreate, CRDocumentResponse,
    CRActivityCreate, CRActivityUpdate, CRActivityResponse,
    CRMemoCreate, CRMemoUpdate, CRMemoResponse,
    CRCallLogCreate, CRCallLogUpdate, CRCallLogResponse,
    CREmailHistoryCreate, CREmailHistoryResponse, SendEmailRequest,
    CRDiligenceShortFormCreate, CRDiligenceShortFormUpdate, CRDiligenceShortFormResponse
)
import json
from app.core.permissions import check_permission

router = APIRouter()

UPLOAD_DIR = "uploads/customer_requirements"


# ============== Main Customer Requirement ==============

@router.post("/", response_model=CustomerRequirementResponse, status_code=status.HTTP_201_CREATED)
def create_customer_requirement(
    data: CustomerRequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new customer requirement record for a lead"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == data.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Check if customer requirement already exists for this lead
    existing = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == data.lead_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer requirement already exists for this lead")

    cr = CustomerRequirement(**data.model_dump())
    cr.created_by = current_user.id

    # Pre-populate from lead data
    if not cr.company_name:
        cr.company_name = lead.company_name

    db.add(cr)
    db.commit()
    db.refresh(cr)

    return cr


@router.get("/lead/{lead_id}", response_model=CustomerRequirementResponse)
def get_customer_requirement_by_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer requirement by lead ID"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        # Auto-create if doesn't exist
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        cr = CustomerRequirement(
            lead_id=lead_id,
            company_name=lead.company_name,
            created_by=current_user.id
        )
        db.add(cr)
        db.commit()
        db.refresh(cr)

    return cr


@router.get("/{cr_id}", response_model=CustomerRequirementResponse)
def get_customer_requirement(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer requirement by ID"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    cr = db.query(CustomerRequirement).filter(CustomerRequirement.id == cr_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Customer requirement not found")

    return cr


@router.put("/{cr_id}", response_model=CustomerRequirementResponse)
def update_customer_requirement(
    cr_id: int,
    data: CustomerRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update customer requirement"""
    if not check_permission(current_user.role, "leads", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    cr = db.query(CustomerRequirement).filter(CustomerRequirement.id == cr_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Customer requirement not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cr, field, value)

    cr.updated_by = current_user.id
    db.commit()
    db.refresh(cr)

    return cr


# ============== Introduction Tab ==============

@router.get("/{cr_id}/introduction", response_model=CRIntroductionResponse)
def get_introduction(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get introduction data"""
    intro = db.query(CRIntroduction).filter(
        CRIntroduction.customer_requirement_id == cr_id
    ).first()

    if not intro:
        intro = CRIntroduction(customer_requirement_id=cr_id, created_by=current_user.id)
        db.add(intro)
        db.commit()
        db.refresh(intro)

    return intro


@router.put("/{cr_id}/introduction", response_model=CRIntroductionResponse)
def update_introduction(
    cr_id: int,
    data: CRIntroductionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update introduction data"""
    intro = db.query(CRIntroduction).filter(
        CRIntroduction.customer_requirement_id == cr_id
    ).first()

    if not intro:
        intro = CRIntroduction(customer_requirement_id=cr_id, created_by=current_user.id)
        db.add(intro)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(intro, field, value)

    db.commit()
    db.refresh(intro)

    return intro


# ============== Requirement Tab ==============

@router.get("/{cr_id}/requirement", response_model=CRRequirementResponse)
def get_requirement(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get requirement data"""
    req = db.query(CRRequirement).filter(
        CRRequirement.customer_requirement_id == cr_id
    ).first()

    if not req:
        req = CRRequirement(customer_requirement_id=cr_id, created_by=current_user.id)
        db.add(req)
        db.commit()
        db.refresh(req)

    return req


@router.put("/{cr_id}/requirement", response_model=CRRequirementResponse)
def update_requirement(
    cr_id: int,
    data: CRRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update requirement data"""
    req = db.query(CRRequirement).filter(
        CRRequirement.customer_requirement_id == cr_id
    ).first()

    if not req:
        req = CRRequirement(customer_requirement_id=cr_id, created_by=current_user.id)
        db.add(req)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(req, field, value)

    db.commit()
    db.refresh(req)

    return req


# ============== Presentation Tab ==============

@router.get("/{cr_id}/presentations", response_model=List[CRPresentationResponse])
def list_presentations(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all presentations"""
    return db.query(CRPresentation).filter(
        CRPresentation.customer_requirement_id == cr_id
    ).order_by(CRPresentation.created_at.desc()).all()


@router.post("/{cr_id}/presentations", response_model=CRPresentationResponse, status_code=status.HTTP_201_CREATED)
def create_presentation(
    cr_id: int,
    data: CRPresentationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new presentation"""
    pres = CRPresentation(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(pres)
    db.commit()
    db.refresh(pres)
    return pres


@router.put("/{cr_id}/presentations/{pres_id}", response_model=CRPresentationResponse)
def update_presentation(
    cr_id: int,
    pres_id: int,
    data: CRPresentationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a presentation"""
    pres = db.query(CRPresentation).filter(
        CRPresentation.id == pres_id,
        CRPresentation.customer_requirement_id == cr_id
    ).first()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pres, field, value)

    db.commit()
    db.refresh(pres)
    return pres


# ============== Demo Tab ==============

@router.get("/{cr_id}/demos", response_model=List[CRDemoResponse])
def list_demos(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all demos"""
    return db.query(CRDemo).filter(
        CRDemo.customer_requirement_id == cr_id
    ).order_by(CRDemo.created_at.desc()).all()


@router.post("/{cr_id}/demos", response_model=CRDemoResponse, status_code=status.HTTP_201_CREATED)
def create_demo(
    cr_id: int,
    data: CRDemoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new demo"""
    demo = CRDemo(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(demo)
    db.commit()
    db.refresh(demo)
    return demo


@router.put("/{cr_id}/demos/{demo_id}", response_model=CRDemoResponse)
def update_demo(
    cr_id: int,
    demo_id: int,
    data: CRDemoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a demo"""
    demo = db.query(CRDemo).filter(
        CRDemo.id == demo_id,
        CRDemo.customer_requirement_id == cr_id
    ).first()
    if not demo:
        raise HTTPException(status_code=404, detail="Demo not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(demo, field, value)

    db.commit()
    db.refresh(demo)
    return demo


# ============== Proposal Tab ==============

@router.get("/{cr_id}/proposals", response_model=List[CRProposalResponse])
def list_proposals(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all proposals"""
    return db.query(CRProposal).filter(
        CRProposal.customer_requirement_id == cr_id
    ).order_by(CRProposal.created_at.desc()).all()


@router.post("/{cr_id}/proposals", response_model=CRProposalResponse, status_code=status.HTTP_201_CREATED)
def create_proposal(
    cr_id: int,
    data: CRProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new proposal"""
    proposal = CRProposal(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.put("/{cr_id}/proposals/{proposal_id}", response_model=CRProposalResponse)
def update_proposal(
    cr_id: int,
    proposal_id: int,
    data: CRProposalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a proposal"""
    proposal = db.query(CRProposal).filter(
        CRProposal.id == proposal_id,
        CRProposal.customer_requirement_id == cr_id
    ).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(proposal, field, value)

    db.commit()
    db.refresh(proposal)
    return proposal


# ============== Agreement Tab ==============

@router.get("/{cr_id}/agreements", response_model=List[CRAgreementResponse])
def list_agreements(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all agreements"""
    return db.query(CRAgreement).filter(
        CRAgreement.customer_requirement_id == cr_id
    ).order_by(CRAgreement.created_at.desc()).all()


@router.post("/{cr_id}/agreements", response_model=CRAgreementResponse, status_code=status.HTTP_201_CREATED)
def create_agreement(
    cr_id: int,
    data: CRAgreementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new agreement"""
    agreement = CRAgreement(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(agreement)
    db.commit()
    db.refresh(agreement)
    return agreement


@router.put("/{cr_id}/agreements/{agreement_id}", response_model=CRAgreementResponse)
def update_agreement(
    cr_id: int,
    agreement_id: int,
    data: CRAgreementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an agreement"""
    agreement = db.query(CRAgreement).filter(
        CRAgreement.id == agreement_id,
        CRAgreement.customer_requirement_id == cr_id
    ).first()
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(agreement, field, value)

    db.commit()
    db.refresh(agreement)
    return agreement


# ============== Call Logs ==============

@router.get("/{cr_id}/call-logs", response_model=List[CRCallLogResponse])
def list_call_logs(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all call logs"""
    return db.query(CRCallLog).filter(
        CRCallLog.customer_requirement_id == cr_id
    ).order_by(CRCallLog.created_at.desc()).all()


@router.post("/{cr_id}/call-logs", response_model=CRCallLogResponse, status_code=status.HTTP_201_CREATED)
def create_call_log(
    cr_id: int,
    data: CRCallLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new call log"""
    call_log = CRCallLog(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(call_log)
    db.commit()
    db.refresh(call_log)
    return call_log


@router.put("/{cr_id}/call-logs/{log_id}", response_model=CRCallLogResponse)
def update_call_log(
    cr_id: int,
    log_id: int,
    data: CRCallLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a call log"""
    call_log = db.query(CRCallLog).filter(
        CRCallLog.id == log_id,
        CRCallLog.customer_requirement_id == cr_id
    ).first()
    if not call_log:
        raise HTTPException(status_code=404, detail="Call log not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(call_log, field, value)

    db.commit()
    db.refresh(call_log)
    return call_log


# ============== Documents (Generic for all tabs) ==============

@router.get("/{cr_id}/documents", response_model=List[CRDocumentResponse])
def list_documents(
    cr_id: int,
    tab_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List documents, optionally filtered by tab"""
    query = db.query(CRDocument).filter(CRDocument.customer_requirement_id == cr_id)
    if tab_name:
        query = query.filter(CRDocument.tab_name == tab_name)
    return query.order_by(CRDocument.uploaded_at.desc()).all()


@router.post("/{cr_id}/documents", response_model=CRDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    cr_id: int,
    tab_name: str = Form(...),
    sub_tab_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document"""
    # Create upload directory if not exists
    upload_path = f"{UPLOAD_DIR}/{cr_id}/{tab_name}"
    os.makedirs(upload_path, exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = f"{upload_path}/{unique_filename}"

    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Create document record
    doc = CRDocument(
        customer_requirement_id=cr_id,
        tab_name=tab_name,
        sub_tab_name=sub_tab_name,
        file_name=file.filename,
        file_path=file_path,
        file_size=len(content),
        file_type=file.content_type,
        description=description,
        uploaded_by=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc


@router.delete("/{cr_id}/documents/{doc_id}")
def delete_document(
    cr_id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    doc = db.query(CRDocument).filter(
        CRDocument.id == doc_id,
        CRDocument.customer_requirement_id == cr_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully"}


# ============== Activities (Generic for all tabs) ==============

@router.get("/{cr_id}/activities", response_model=List[CRActivityResponse])
def list_activities(
    cr_id: int,
    tab_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List activities, optionally filtered by tab"""
    query = db.query(CRActivity).filter(CRActivity.customer_requirement_id == cr_id)
    if tab_name:
        query = query.filter(CRActivity.tab_name == tab_name)
    return query.order_by(CRActivity.created_at.desc()).all()


@router.post("/{cr_id}/activities", response_model=CRActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    cr_id: int,
    data: CRActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity"""
    activity = CRActivity(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/{cr_id}/activities/{activity_id}", response_model=CRActivityResponse)
def update_activity(
    cr_id: int,
    activity_id: int,
    data: CRActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an activity"""
    activity = db.query(CRActivity).filter(
        CRActivity.id == activity_id,
        CRActivity.customer_requirement_id == cr_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{cr_id}/activities/{activity_id}")
def delete_activity(
    cr_id: int,
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an activity"""
    activity = db.query(CRActivity).filter(
        CRActivity.id == activity_id,
        CRActivity.customer_requirement_id == cr_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}


# ============== Memos (Generic for all tabs) ==============

@router.get("/{cr_id}/memos", response_model=List[CRMemoResponse])
def list_memos(
    cr_id: int,
    tab_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List memos, optionally filtered by tab"""
    query = db.query(CRMemo).filter(CRMemo.customer_requirement_id == cr_id)
    if tab_name:
        query = query.filter(CRMemo.tab_name == tab_name)
    return query.order_by(CRMemo.created_at.desc()).all()


@router.post("/{cr_id}/memos", response_model=CRMemoResponse, status_code=status.HTTP_201_CREATED)
def create_memo(
    cr_id: int,
    data: CRMemoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new memo"""
    memo = CRMemo(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(memo)
    db.commit()
    db.refresh(memo)
    return memo


@router.put("/{cr_id}/memos/{memo_id}", response_model=CRMemoResponse)
def update_memo(
    cr_id: int,
    memo_id: int,
    data: CRMemoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a memo"""
    memo = db.query(CRMemo).filter(
        CRMemo.id == memo_id,
        CRMemo.customer_requirement_id == cr_id
    ).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(memo, field, value)

    db.commit()
    db.refresh(memo)
    return memo


@router.delete("/{cr_id}/memos/{memo_id}")
def delete_memo(
    cr_id: int,
    memo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a memo"""
    memo = db.query(CRMemo).filter(
        CRMemo.id == memo_id,
        CRMemo.customer_requirement_id == cr_id
    ).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")

    db.delete(memo)
    db.commit()

    return {"message": "Memo deleted successfully"}


# ============== Email History (Generic for all tabs) ==============

@router.get("/{cr_id}/emails", response_model=List[CREmailHistoryResponse])
def list_email_history(
    cr_id: int,
    tab_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List email history, optionally filtered by tab"""
    query = db.query(CREmailHistory).filter(CREmailHistory.customer_requirement_id == cr_id)
    if tab_name:
        query = query.filter(CREmailHistory.tab_name == tab_name)
    return query.order_by(CREmailHistory.sent_at.desc()).all()


@router.get("/{cr_id}/emails/{email_id}", response_model=CREmailHistoryResponse)
def get_email_history_detail(
    cr_id: int,
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get email history detail by ID"""
    email = db.query(CREmailHistory).filter(
        CREmailHistory.id == email_id,
        CREmailHistory.customer_requirement_id == cr_id
    ).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email record not found")
    return email


@router.post("/{cr_id}/emails", response_model=CREmailHistoryResponse, status_code=status.HTTP_201_CREATED)
def send_email(
    cr_id: int,
    data: SendEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send an email and store in history"""
    # Verify customer requirement exists
    cr = db.query(CustomerRequirement).filter(CustomerRequirement.id == cr_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Customer requirement not found")

    # Convert attachment IDs list to JSON string
    attachment_ids_str = None
    if data.attachment_ids:
        attachment_ids_str = json.dumps(data.attachment_ids)

    # Create email history record
    email_record = CREmailHistory(
        customer_requirement_id=cr_id,
        tab_name=data.tab_name,
        template_id=data.template_id,
        template_name=data.template_name,
        to_email=data.to_email,
        cc_email=data.cc_email,
        bcc_email=data.bcc_email,
        email_name=data.email_name,
        subject=data.subject,
        content=data.content,
        attachment_ids=attachment_ids_str,
        status='sent',  # For now, we'll mark as sent. Real email sending can be added later
        created_by=current_user.id
    )

    db.add(email_record)
    db.commit()
    db.refresh(email_record)

    # TODO: Add actual email sending logic here using SMTP or email service
    # For now, we're just storing the email record

    return email_record


@router.delete("/{cr_id}/emails/{email_id}")
def delete_email_history(
    cr_id: int,
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an email history record"""
    email = db.query(CREmailHistory).filter(
        CREmailHistory.id == email_id,
        CREmailHistory.customer_requirement_id == cr_id
    ).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email record not found")

    db.delete(email)
    db.commit()

    return {"message": "Email record deleted successfully"}


# ============== Diligence Short Form (Pre-Demo Business Questionnaire) ==============

@router.get("/{cr_id}/diligence-short-form", response_model=CRDiligenceShortFormResponse)
def get_diligence_short_form(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get diligence short form (Pre-Demo Business Questionnaire) data"""
    form = db.query(CRDiligenceShortForm).filter(
        CRDiligenceShortForm.customer_requirement_id == cr_id
    ).first()

    if not form:
        # Auto-create with default values
        form = CRDiligenceShortForm(customer_requirement_id=cr_id, created_by=current_user.id)
        db.add(form)
        db.commit()
        db.refresh(form)

    return form


@router.put("/{cr_id}/diligence-short-form", response_model=CRDiligenceShortFormResponse)
def update_diligence_short_form(
    cr_id: int,
    data: CRDiligenceShortFormUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update diligence short form (Pre-Demo Business Questionnaire) data"""
    form = db.query(CRDiligenceShortForm).filter(
        CRDiligenceShortForm.customer_requirement_id == cr_id
    ).first()

    if not form:
        form = CRDiligenceShortForm(customer_requirement_id=cr_id, created_by=current_user.id)
        db.add(form)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(form, field, value)

    db.commit()
    db.refresh(form)

    return form


@router.post("/{cr_id}/diligence-short-form", response_model=CRDiligenceShortFormResponse, status_code=status.HTTP_201_CREATED)
def create_diligence_short_form(
    cr_id: int,
    data: CRDiligenceShortFormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create diligence short form (Pre-Demo Business Questionnaire) data"""
    # Check if form already exists
    existing = db.query(CRDiligenceShortForm).filter(
        CRDiligenceShortForm.customer_requirement_id == cr_id
    ).first()

    if existing:
        # Update existing form instead of creating new one
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    form = CRDiligenceShortForm(customer_requirement_id=cr_id, **data.model_dump(), created_by=current_user.id)
    db.add(form)
    db.commit()
    db.refresh(form)

    return form


# ============== Meeting Calendar (Meeting Date & Time) ==============

@router.get("/{cr_id}/meeting-calendar")
def get_meeting_calendar(
    cr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get meeting calendar (Meeting Date & Time) data"""
    # Get customer requirement for auto-fill data
    cr = db.query(CustomerRequirement).filter(CustomerRequirement.id == cr_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Customer requirement not found")

    form = db.query(CRMeetingCalendar).filter(
        CRMeetingCalendar.customer_requirement_id == cr_id
    ).first()

    if not form:
        # Auto-create with default values from customer requirement
        form = CRMeetingCalendar(
            customer_requirement_id=cr_id,
            gi_name=cr.contact_name,
            gi_company=cr.company_name,
            gi_address=cr.address_line1,
            gi_country=cr.country_id,
            gi_province=cr.state_id,
            gi_city=cr.city_id,
            gi_postal=cr.zip_code,
            gi_phone=cr.phone_no,
            gi_ext=cr.phone_ext,
            gi_fax=cr.fax,
            gi_email=cr.contact_email,
            gi_website=cr.website,
            gi_branch_office=cr.branch_office,
            timezone=cr.timezone_id,
            timezone2=cr.timezone_id,
            created_by=current_user.id
        )
        db.add(form)
        db.commit()
        db.refresh(form)

    # Return data with auto-filled general information from CR
    return {
        "id": form.id,
        "customer_requirement_id": form.customer_requirement_id,
        # General Information - always from CustomerRequirement (auto-filled)
        "gi_name": cr.contact_name,
        "gi_company": cr.company_name,
        "gi_address": cr.address_line1,
        "gi_country": cr.country_id,
        "gi_province": cr.state_id,
        "gi_city": cr.city_id,
        "gi_postal": cr.zip_code,
        "gi_phone": cr.phone_no,
        "gi_ext": cr.phone_ext,
        "gi_fax": cr.fax,
        "gi_email": cr.contact_email,
        "gi_website": cr.website,
        "gi_branch_office": cr.branch_office,
        "gi_branch_address": form.gi_branch_address,
        # Meeting Session - from form
        "prefered_date": form.prefered_date,
        "prefered_time": form.prefered_time,
        "gi_remark": form.gi_remark,
        "timezone": form.timezone or cr.timezone_id,
        "prefered_date2": form.prefered_date2,
        "prefered_time2": form.prefered_time2,
        "gi_remark2": form.gi_remark2,
        "timezone2": form.timezone2 or cr.timezone_id,
        # Status
        "submit_status": form.submit_status,
        "created_at": form.created_at,
        "updated_at": form.updated_at,
    }


# ============== PDF Generation ==============
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from io import BytesIO
import tempfile


@router.get("/{cr_id}/generate-pdf/{tab_name}")
def generate_pdf(
    cr_id: int,
    tab_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate PDF for a specific tab (agreement, proposal, requirement, etc.)"""
    if not check_permission(current_user.role, "leads", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Get customer requirement
    cr = db.query(CustomerRequirement).filter(CustomerRequirement.id == cr_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Customer requirement not found")

    # Get lead info
    lead = db.query(Lead).filter(Lead.id == cr.lead_id).first()

    # Create PDF
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    doc = SimpleDocTemplate(temp_file.name, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=18, spaceAfter=30, alignment=1)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=14, spaceAfter=12)
    normal_style = styles['Normal']

    story = []

    # Header
    company_name = cr.company_name or (lead.company_name if lead else "N/A")
    story.append(Paragraph(f"Customer Requirement - {tab_name.title()}", title_style))
    story.append(Paragraph(f"Company: {company_name}", normal_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
    story.append(Spacer(1, 20))

    # Tab-specific content
    if tab_name == "agreement":
        agreement = db.query(CRAgreement).filter(CRAgreement.customer_requirement_id == cr_id).first()
        if agreement:
            story.append(Paragraph("Agreement Details", heading_style))
            story.append(Paragraph(f"Agreement Type: {agreement.agreement_type or 'N/A'}", normal_style))
            story.append(Paragraph(f"Status: {agreement.status or 'N/A'}", normal_style))
            if agreement.content:
                story.append(Spacer(1, 10))
                story.append(Paragraph("Content:", heading_style))
                # Strip HTML tags for PDF
                import re
                clean_content = re.sub('<[^<]+?>', '', agreement.content or '')
                story.append(Paragraph(clean_content[:2000], normal_style))

    elif tab_name == "proposal":
        proposal = db.query(CRProposal).filter(CRProposal.customer_requirement_id == cr_id).first()
        if proposal:
            story.append(Paragraph("Proposal Details", heading_style))
            story.append(Paragraph(f"Status: {proposal.status or 'N/A'}", normal_style))
            story.append(Paragraph(f"Proposal Date: {proposal.proposal_date or 'N/A'}", normal_style))
            if proposal.content:
                story.append(Spacer(1, 10))
                import re
                clean_content = re.sub('<[^<]+?>', '', proposal.content or '')
                story.append(Paragraph(clean_content[:2000], normal_style))

    elif tab_name == "requirement":
        requirement = db.query(CRRequirement).filter(CRRequirement.customer_requirement_id == cr_id).first()
        if requirement:
            story.append(Paragraph("Requirement Details", heading_style))
            if requirement.requirements_json:
                try:
                    reqs = json.loads(requirement.requirements_json) if isinstance(requirement.requirements_json, str) else requirement.requirements_json
                    if isinstance(reqs, list):
                        for i, req in enumerate(reqs[:20], 1):
                            if isinstance(req, dict):
                                story.append(Paragraph(f"{i}. {req.get('title', req.get('name', 'N/A'))}", normal_style))
                except:
                    pass

    elif tab_name == "introduction":
        intro = db.query(CRIntroduction).filter(CRIntroduction.customer_requirement_id == cr_id).first()
        if intro:
            story.append(Paragraph("Introduction Details", heading_style))
            story.append(Paragraph(f"Contact Person: {intro.contact_person or 'N/A'}", normal_style))
            story.append(Paragraph(f"Email: {intro.email or 'N/A'}", normal_style))
            story.append(Paragraph(f"Phone: {intro.phone or 'N/A'}", normal_style))
            if intro.notes:
                story.append(Spacer(1, 10))
                story.append(Paragraph(f"Notes: {intro.notes}", normal_style))

    elif tab_name == "demo":
        demo = db.query(CRDemo).filter(CRDemo.customer_requirement_id == cr_id).first()
        if demo:
            story.append(Paragraph("Demo Details", heading_style))
            story.append(Paragraph(f"Demo Date: {demo.demo_date or 'N/A'}", normal_style))
            story.append(Paragraph(f"Status: {demo.status or 'N/A'}", normal_style))
            if demo.notes:
                story.append(Paragraph(f"Notes: {demo.notes}", normal_style))

    elif tab_name == "presentation":
        pres = db.query(CRPresentation).filter(CRPresentation.customer_requirement_id == cr_id).first()
        if pres:
            story.append(Paragraph("Presentation Details", heading_style))
            story.append(Paragraph(f"Status: {pres.status or 'N/A'}", normal_style))
            if pres.notes:
                story.append(Paragraph(f"Notes: {pres.notes}", normal_style))

    else:
        story.append(Paragraph(f"PDF generation for '{tab_name}' tab", normal_style))

    # Build PDF
    doc.build(story)

    # Return file
    filename = f"CR_{cr_id}_{tab_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return FileResponse(
        temp_file.name,
        media_type='application/pdf',
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

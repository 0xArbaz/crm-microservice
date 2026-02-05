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
    CRSupport, CRCallLog, CRDocument, CRActivity, CRMemo, CRStatusHistory
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
    CRCallLogCreate, CRCallLogUpdate, CRCallLogResponse
)
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

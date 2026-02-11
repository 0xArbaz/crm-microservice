from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.cri_email_template import CRIEmailTemplate
from app.schemas.cri_email_template import (
    CRIEmailTemplateCreate,
    CRIEmailTemplateUpdate,
    CRIEmailTemplateResponse
)

router = APIRouter()


@router.get("/", response_model=List[CRIEmailTemplateResponse])
def get_cri_email_templates(
    tab: Optional[str] = Query(None, description="Filter by tab name"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all CRI email templates with optional filters"""
    query = db.query(CRIEmailTemplate)

    if tab:
        query = query.filter(CRIEmailTemplate.tab == tab)
    if company_id:
        query = query.filter(CRIEmailTemplate.company_id == company_id)

    return query.order_by(CRIEmailTemplate.id.desc()).all()


@router.get("/{template_id}", response_model=CRIEmailTemplateResponse)
def get_cri_email_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific CRI email template by ID"""
    template = db.query(CRIEmailTemplate).filter(CRIEmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="CRI email template not found")
    return template


@router.post("/", response_model=CRIEmailTemplateResponse)
def create_cri_email_template(
    template_data: CRIEmailTemplateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new CRI email template"""
    template = CRIEmailTemplate(**template_data.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.put("/{template_id}", response_model=CRIEmailTemplateResponse)
def update_cri_email_template(
    template_id: int,
    template_data: CRIEmailTemplateUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update an existing CRI email template"""
    template = db.query(CRIEmailTemplate).filter(CRIEmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="CRI email template not found")

    update_data = template_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)

    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}")
def delete_cri_email_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a CRI email template"""
    template = db.query(CRIEmailTemplate).filter(CRIEmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="CRI email template not found")

    db.delete(template)
    db.commit()
    return {"message": "CRI email template deleted successfully"}

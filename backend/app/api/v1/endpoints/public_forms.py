from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.customer_requirement import CustomerRequirement, CRDiligenceShortForm, CRMeetingCalendar, CRPresentationMeeting
from app.schemas.customer_requirement import (
    CRDiligenceShortFormUpdate, CRDiligenceShortFormResponse,
    CRMeetingCalendarUpdate, CRMeetingCalendarResponse,
    CRPresentationMeetingUpdate, CRPresentationMeetingResponse
)

router = APIRouter()


# ============== Public Diligence Short Form ==============

@router.get("/diligence/{lead_id}", response_model=CRDiligenceShortFormResponse)
def get_public_diligence_form(
    lead_id: int,
    db: Session = Depends(get_db)
):
    """Get diligence short form by lead ID (public access)"""
    # Find customer requirement by lead ID
    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        raise HTTPException(status_code=404, detail="Form not found")

    # Get diligence form
    form = db.query(CRDiligenceShortForm).filter(
        CRDiligenceShortForm.customer_requirement_id == cr.id
    ).first()

    if not form:
        # Auto-create if doesn't exist
        form = CRDiligenceShortForm(customer_requirement_id=cr.id)
        db.add(form)
        db.commit()
        db.refresh(form)

    return form


@router.put("/diligence/{lead_id}", response_model=CRDiligenceShortFormResponse)
def update_public_diligence_form(
    lead_id: int,
    data: CRDiligenceShortFormUpdate,
    db: Session = Depends(get_db)
):
    """Update diligence short form by lead ID (public access)"""
    # Find customer requirement by lead ID
    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        raise HTTPException(status_code=404, detail="Form not found")

    # Get or create diligence form
    form = db.query(CRDiligenceShortForm).filter(
        CRDiligenceShortForm.customer_requirement_id == cr.id
    ).first()

    if not form:
        form = CRDiligenceShortForm(customer_requirement_id=cr.id)
        db.add(form)

    # Update form fields
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(form, field, value)

    db.commit()
    db.refresh(form)

    return form


@router.get("/customer-requirement/{lead_id}")
def get_public_customer_requirement(
    lead_id: int,
    db: Session = Depends(get_db)
):
    """Get customer requirement basic info by lead ID (public access)"""
    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        raise HTTPException(status_code=404, detail="Customer requirement not found")

    return {
        "id": cr.id,
        "lead_id": cr.lead_id,
        "company_name": cr.company_name,
        "address_line1": cr.address_line1,
        "country_id": cr.country_id,
        "state_id": cr.state_id,
        "city_id": cr.city_id,
        "zip_code": cr.zip_code,
        "phone_no": cr.phone_no,
        "phone_ext": cr.phone_ext,
        "fax": cr.fax,
        "website": cr.website,
        "contact_name": cr.contact_name,
        "contact_email": cr.contact_email,
        "branch_office": cr.branch_office,
        "timezone_id": cr.timezone_id,
    }


# ============== Public Meeting Calendar Form ==============

@router.get("/meeting-calendar/{lead_id}")
def get_public_meeting_calendar(
    lead_id: int,
    db: Session = Depends(get_db)
):
    """Get meeting calendar form by lead ID (public access)"""
    # Find customer requirement by lead ID
    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        raise HTTPException(status_code=404, detail="Form not found")

    # Get meeting calendar form
    form = db.query(CRMeetingCalendar).filter(
        CRMeetingCalendar.customer_requirement_id == cr.id
    ).first()

    if not form:
        # Auto-create with pre-filled data from customer requirement
        form = CRMeetingCalendar(
            customer_requirement_id=cr.id,
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
        )
        db.add(form)
        db.commit()
        db.refresh(form)

    # Always return fresh data from CustomerRequirement for General Information fields
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


@router.put("/meeting-calendar/{lead_id}")
def update_public_meeting_calendar(
    lead_id: int,
    data: CRMeetingCalendarUpdate,
    db: Session = Depends(get_db)
):
    """Update meeting calendar form by lead ID (public access)"""
    # Find customer requirement by lead ID
    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        raise HTTPException(status_code=404, detail="Form not found")

    # Get or create meeting calendar form
    form = db.query(CRMeetingCalendar).filter(
        CRMeetingCalendar.customer_requirement_id == cr.id
    ).first()

    if not form:
        form = CRMeetingCalendar(
            customer_requirement_id=cr.id,
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
        )
        db.add(form)

    # Update only the editable form fields (meeting session fields)
    editable_fields = [
        'prefered_date', 'prefered_time', 'gi_remark', 'timezone',
        'prefered_date2', 'prefered_time2', 'gi_remark2', 'timezone2',
        'gi_branch_address', 'submit_status'
    ]
    for field, value in data.model_dump(exclude_unset=True).items():
        if field in editable_fields:
            setattr(form, field, value)

    # Always sync general information from CustomerRequirement
    form.gi_name = cr.contact_name
    form.gi_company = cr.company_name
    form.gi_address = cr.address_line1
    form.gi_country = cr.country_id
    form.gi_province = cr.state_id
    form.gi_city = cr.city_id
    form.gi_postal = cr.zip_code
    form.gi_phone = cr.phone_no
    form.gi_ext = cr.phone_ext
    form.gi_fax = cr.fax
    form.gi_email = cr.contact_email
    form.gi_website = cr.website
    form.gi_branch_office = cr.branch_office

    db.commit()
    db.refresh(form)

    # Return fresh data
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


# ============== Public Presentation Meeting Form ==============

@router.get("/presentation-meeting/{lead_id}")
def get_public_presentation_meeting(
    lead_id: int,
    db: Session = Depends(get_db)
):
    """Get presentation meeting form by lead ID (public access)"""
    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        raise HTTPException(status_code=404, detail="Form not found")

    form = db.query(CRPresentationMeeting).filter(
        CRPresentationMeeting.customer_requirement_id == cr.id
    ).first()

    if not form:
        form = CRPresentationMeeting(
            customer_requirement_id=cr.id,
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
        )
        db.add(form)
        db.commit()
        db.refresh(form)

    return {
        "id": form.id,
        "customer_requirement_id": form.customer_requirement_id,
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
        "prefered_date": form.prefered_date,
        "prefered_time": form.prefered_time,
        "gi_remark": form.gi_remark,
        "timezone": form.timezone or cr.timezone_id,
        "submit_status": form.submit_status,
        "created_at": form.created_at,
        "updated_at": form.updated_at,
    }


@router.put("/presentation-meeting/{lead_id}")
def update_public_presentation_meeting(
    lead_id: int,
    data: CRPresentationMeetingUpdate,
    db: Session = Depends(get_db)
):
    """Update presentation meeting form by lead ID (public access)"""
    cr = db.query(CustomerRequirement).filter(
        CustomerRequirement.lead_id == lead_id
    ).first()

    if not cr:
        raise HTTPException(status_code=404, detail="Form not found")

    form = db.query(CRPresentationMeeting).filter(
        CRPresentationMeeting.customer_requirement_id == cr.id
    ).first()

    if not form:
        form = CRPresentationMeeting(
            customer_requirement_id=cr.id,
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
        )
        db.add(form)

    editable_fields = ['prefered_date', 'prefered_time', 'gi_remark', 'timezone', 'gi_branch_address', 'submit_status']
    for field, value in data.model_dump(exclude_unset=True).items():
        if field in editable_fields:
            setattr(form, field, value)

    form.gi_name = cr.contact_name
    form.gi_company = cr.company_name
    form.gi_address = cr.address_line1
    form.gi_country = cr.country_id
    form.gi_province = cr.state_id
    form.gi_city = cr.city_id
    form.gi_postal = cr.zip_code
    form.gi_phone = cr.phone_no
    form.gi_ext = cr.phone_ext
    form.gi_fax = cr.fax
    form.gi_email = cr.contact_email
    form.gi_website = cr.website
    form.gi_branch_office = cr.branch_office

    db.commit()
    db.refresh(form)

    return {
        "id": form.id,
        "customer_requirement_id": form.customer_requirement_id,
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
        "prefered_date": form.prefered_date,
        "prefered_time": form.prefered_time,
        "gi_remark": form.gi_remark,
        "timezone": form.timezone or cr.timezone_id,
        "submit_status": form.submit_status,
        "created_at": form.created_at,
        "updated_at": form.updated_at,
    }

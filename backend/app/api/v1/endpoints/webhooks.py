from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import hashlib
import hmac
import json

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.webhook import WebhookConfig, WebhookLog, WebhookDirection, WebhookEvent
from app.models.pre_lead import PreLead, PreLeadSource
from app.models.lead import Lead, LeadSource, LeadPriority
from app.schemas.webhook import (
    WebhookConfigCreate, WebhookConfigUpdate, WebhookConfigResponse,
    WebhookLogResponse, IncomingWebhookPayload,
    WebhookConfigListResponse, WebhookLogListResponse
)
from app.core.permissions import check_permission

router = APIRouter()


def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify HMAC signature of incoming webhook"""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)


def log_webhook(db: Session, direction: WebhookDirection, event: str, payload: dict,
                entity_type: str = None, entity_id: int = None) -> WebhookLog:
    """Create a webhook log entry"""
    log = WebhookLog(
        direction=direction,
        event=WebhookEvent(event) if event in [e.value for e in WebhookEvent] else None,
        method="POST",
        request_payload=payload,
        entity_type=entity_type,
        entity_id=entity_id
    )
    return log


# ================== INCOMING WEBHOOKS - PRE-LEAD ==================

@router.post("/incoming/pre-lead/create", status_code=status.HTTP_200_OK)
async def webhook_create_pre_lead(
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Create a new pre-lead via webhook

    **Event:** `new_inquiry`

    **Payload Data Fields:**
    - first_name: str (required)
    - last_name: str
    - email: str
    - phone: str
    - company_name: str
    - source: str (website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, other)
    - product_interest: str
    - requirements: str
    - city, state, country: str
    - address_line1, address_line2: str
    - zip_code: str
    - notes: str
    - lead_status: str
    - industry_id: int
    - region_id: int
    - office_timings: str
    - timezone: str
    """
    log = log_webhook(db, WebhookDirection.INCOMING, "new_inquiry", payload.model_dump())

    try:
        if x_webhook_signature and settings.WEBHOOK_SECRET:
            body = await request.body()
            if not verify_webhook_signature(body, x_webhook_signature, settings.WEBHOOK_SECRET):
                log.is_successful = False
                log.error_message = "Invalid webhook signature"
                db.add(log)
                db.commit()
                raise HTTPException(status_code=401, detail="Invalid signature")

        data = payload.data

        # Map source string to enum
        source_mapping = {
            "website": PreLeadSource.WEBSITE,
            "referral": PreLeadSource.REFERRAL,
            "social_media": PreLeadSource.SOCIAL_MEDIA,
            "cold_call": PreLeadSource.COLD_CALL,
            "walk_in": PreLeadSource.WALK_IN,
            "whatsapp": PreLeadSource.WHATSAPP,
            "email": PreLeadSource.EMAIL,
            "erp": PreLeadSource.ERP,
            "other": PreLeadSource.OTHER,
        }
        source_value = data.get("source") or payload.source
        source_enum = source_mapping.get(source_value, PreLeadSource.WEBSITE)

        pre_lead = PreLead(
            first_name=data.get("first_name") or data.get("company_name") or "Unknown",
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            company_name=data.get("company_name"),
            source=source_enum,
            source_details=f"Webhook: {payload.source}",
            product_interest=data.get("product_interest"),
            requirements=data.get("requirements"),
            city=data.get("city"),
            state=data.get("state"),
            country=data.get("country", "India"),
            notes=data.get("notes"),
            address_line1=data.get("address_line1"),
            address_line2=data.get("address_line2"),
            zip_code=data.get("zip_code"),
            lead_status=data.get("lead_status"),
            industry_id=data.get("industry_id"),
            region_id=data.get("region_id"),
            office_timings=data.get("office_timings"),
            timezone=data.get("timezone"),
            company_id=data.get("company_id") or 1,
        )
        db.add(pre_lead)
        db.flush()

        log.entity_type = "pre_lead"
        log.entity_id = pre_lead.id
        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Pre-lead created successfully",
            "data": {"pre_lead_id": pre_lead.id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/pre-lead/{pre_lead_id}/update", status_code=status.HTTP_200_OK)
async def webhook_update_pre_lead(
    pre_lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Update an existing pre-lead via webhook

    **Event:** `pre_lead_update`

    **Payload Data Fields:** (all optional)
    - first_name, last_name, email, phone: str
    - company_name: str
    - product_interest, requirements: str
    - city, state, country: str
    - address_line1, address_line2, zip_code: str
    - lead_status: str
    - industry_id, region_id: int
    - office_timings, timezone: str
    - notes, remarks: str
    """
    log = log_webhook(db, WebhookDirection.INCOMING, "pre_lead_update", payload.model_dump(), "pre_lead", pre_lead_id)

    try:
        pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
        if not pre_lead:
            raise HTTPException(status_code=404, detail="Pre-lead not found")

        data = payload.data

        # Update fields if provided
        updatable_fields = [
            'first_name', 'last_name', 'email', 'phone', 'company_name',
            'product_interest', 'requirements', 'city', 'state', 'country',
            'address_line1', 'address_line2', 'zip_code', 'lead_status',
            'industry_id', 'region_id', 'office_timings', 'timezone',
            'notes', 'remarks', 'memo', 'fax', 'phone_no'
        ]

        for field in updatable_fields:
            if field in data and data[field] is not None:
                setattr(pre_lead, field, data[field])

        pre_lead.updated_at = datetime.utcnow()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Pre-lead updated successfully",
            "data": {"pre_lead_id": pre_lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/pre-lead/{pre_lead_id}/discard", status_code=status.HTTP_200_OK)
async def webhook_discard_pre_lead(
    pre_lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Discard a pre-lead via webhook

    **Event:** `pre_lead_discard`

    **Payload Data Fields:**
    - reason: str (optional - reason for discarding)
    """
    log = log_webhook(db, WebhookDirection.INCOMING, "pre_lead_discard", payload.model_dump(), "pre_lead", pre_lead_id)

    try:
        pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
        if not pre_lead:
            raise HTTPException(status_code=404, detail="Pre-lead not found")

        pre_lead.status = 1  # 1 = discarded
        if payload.data.get("reason"):
            pre_lead.remarks = payload.data.get("reason")
        pre_lead.updated_at = datetime.utcnow()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Pre-lead discarded successfully",
            "data": {"pre_lead_id": pre_lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/pre-lead/{pre_lead_id}/contact/add", status_code=status.HTTP_200_OK)
async def webhook_add_pre_lead_contact(
    pre_lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Add a contact to a pre-lead via webhook

    **Event:** `pre_lead_contact_add`

    **Payload Data Fields:**
    - first_name: str (required)
    - last_name: str
    - email: str
    - phone: str
    - designation: str
    - department: str
    - is_primary: bool
    - contact_type: str (primary, billing, technical, decision_maker)
    """
    from app.models.pre_lead_contact import PreLeadContact

    log = log_webhook(db, WebhookDirection.INCOMING, "pre_lead_contact_add", payload.model_dump(), "pre_lead", pre_lead_id)

    try:
        pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
        if not pre_lead:
            raise HTTPException(status_code=404, detail="Pre-lead not found")

        data = payload.data

        contact = PreLeadContact(
            pre_lead_id=pre_lead_id,
            first_name=data.get("first_name", "Unknown"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            designation=data.get("designation"),
            department=data.get("department"),
            is_primary=data.get("is_primary", False),
            contact_type=data.get("contact_type", "primary")
        )
        db.add(contact)
        db.flush()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Contact added successfully",
            "data": {"contact_id": contact.id, "pre_lead_id": pre_lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/pre-lead/{pre_lead_id}/memo/add", status_code=status.HTTP_200_OK)
async def webhook_add_pre_lead_memo(
    pre_lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Add a memo to a pre-lead via webhook

    **Event:** `pre_lead_memo_add`

    **Payload Data Fields:**
    - title: str (required)
    - content: str (required)
    - memo_type: str (general, meeting_notes, call_notes, internal, important)
    """
    from app.models.pre_lead_memo import PreLeadMemo

    log = log_webhook(db, WebhookDirection.INCOMING, "pre_lead_memo_add", payload.model_dump(), "pre_lead", pre_lead_id)

    try:
        pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
        if not pre_lead:
            raise HTTPException(status_code=404, detail="Pre-lead not found")

        data = payload.data

        memo = PreLeadMemo(
            pre_lead_id=pre_lead_id,
            title=data.get("title", "Memo"),
            content=data.get("content", ""),
            memo_type=data.get("memo_type", "general")
        )
        db.add(memo)
        db.flush()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Memo added successfully",
            "data": {"memo_id": memo.id, "pre_lead_id": pre_lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/pre-lead/{pre_lead_id}/status/update", status_code=status.HTTP_200_OK)
async def webhook_update_pre_lead_status(
    pre_lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Update pre-lead status via webhook

    **Event:** `pre_lead_status_update`

    **Payload Data Fields:**
    - lead_status: str (required)
    - remarks: str (optional)
    - status_date: str (optional - ISO date)
    """
    from app.models.pre_lead_status_history import PreLeadStatusHistory

    log = log_webhook(db, WebhookDirection.INCOMING, "pre_lead_status_update", payload.model_dump(), "pre_lead", pre_lead_id)

    try:
        pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
        if not pre_lead:
            raise HTTPException(status_code=404, detail="Pre-lead not found")

        data = payload.data
        old_status = pre_lead.lead_status
        new_status = data.get("lead_status")

        if not new_status:
            raise HTTPException(status_code=400, detail="lead_status is required")

        pre_lead.lead_status = new_status
        pre_lead.updated_at = datetime.utcnow()

        # Parse status date
        from datetime import date
        status_date = date.today()
        if data.get("status_date"):
            try:
                status_date = datetime.fromisoformat(data["status_date"].replace('Z', '+00:00')).date()
            except:
                pass

        # Create status history
        status_history = PreLeadStatusHistory(
            pre_lead_id=pre_lead_id,
            status=new_status,
            status_date=status_date,
            remarks=data.get("remarks")
        )
        db.add(status_history)

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Pre-lead status updated successfully",
            "data": {"pre_lead_id": pre_lead_id, "old_status": old_status, "new_status": new_status}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/pre-lead/{pre_lead_id}/document/add", status_code=status.HTTP_200_OK)
async def webhook_add_pre_lead_document(
    pre_lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Add a document to a pre-lead via webhook

    **Event:** `pre_lead_document_add`

    **Payload Data Fields:**
    - name: str (required) - Stored filename
    - original_name: str (required) - Original filename uploaded by user
    - file_path: str (required) - Path where file is stored
    - file_type: str (optional) - MIME type or file extension (e.g., "application/pdf", "image/png")
    - size: int (optional) - File size in bytes
    - notes: str (optional) - Additional notes about the document
    - uploaded_by: int (optional) - User ID who uploaded the file
    - company_id: int (optional) - Company ID for tracking

    **Example Payload:**
    ```json
    {
        "event": "pre_lead_document_add",
        "source": "erp",
        "data": {
            "name": "doc_12345.pdf",
            "original_name": "Business_Proposal.pdf",
            "file_path": "/uploads/pre_leads/123/doc_12345.pdf",
            "file_type": "application/pdf",
            "size": 524288,
            "notes": "Initial business proposal document",
            "uploaded_by": 1,
            "company_id": 1
        }
    }
    ```
    """
    from app.models.lead_document import LeadDocument

    log = log_webhook(db, WebhookDirection.INCOMING, "pre_lead_document_add", payload.model_dump(), "pre_lead", pre_lead_id)

    try:
        pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
        if not pre_lead:
            raise HTTPException(status_code=404, detail="Pre-lead not found")

        data = payload.data

        # Validate required fields
        if not data.get("name"):
            raise HTTPException(status_code=400, detail="name is required")
        if not data.get("original_name"):
            raise HTTPException(status_code=400, detail="original_name is required")
        if not data.get("file_path"):
            raise HTTPException(status_code=400, detail="file_path is required")

        # For pre-lead documents, we use lead_id as NULL and set pre_lead_id
        # This allows tracking documents even before lead conversion
        document = LeadDocument(
            lead_id=pre_lead.converted_lead_id if pre_lead.is_converted else None,
            name=data.get("name"),
            original_name=data.get("original_name"),
            file_path=data.get("file_path"),
            file_type=data.get("file_type"),
            size=data.get("size"),
            notes=data.get("notes"),
            uploaded_by=data.get("uploaded_by"),
            company_id=data.get("company_id") or pre_lead.company_id,
            pre_lead_id=pre_lead_id
        )
        db.add(document)
        db.flush()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Document added to pre-lead successfully",
            "data": {
                "document_id": document.id,
                "pre_lead_id": pre_lead_id,
                "name": document.name,
                "original_name": document.original_name,
                "file_path": document.file_path,
                "file_type": document.file_type,
                "size": document.size
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/pre-lead/{pre_lead_id}/convert", status_code=status.HTTP_200_OK)
async def webhook_convert_pre_lead_to_lead(
    pre_lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Convert pre-lead to lead via webhook

    **Event:** `pre_lead_convert`

    **Payload Data Fields:** (optional, will use pre-lead data if not provided)
    - priority: str (low, medium, high, critical)
    - assigned_to: int (user ID)
    - expected_value: float
    - notes: str
    """
    log = log_webhook(db, WebhookDirection.INCOMING, "pre_lead_convert", payload.model_dump(), "pre_lead", pre_lead_id)

    try:
        pre_lead = db.query(PreLead).filter(PreLead.id == pre_lead_id).first()
        if not pre_lead:
            raise HTTPException(status_code=404, detail="Pre-lead not found")

        if pre_lead.is_converted:
            raise HTTPException(status_code=400, detail="Pre-lead already converted")

        data = payload.data

        # Map priority
        priority_mapping = {
            "low": LeadPriority.LOW,
            "medium": LeadPriority.MEDIUM,
            "high": LeadPriority.HIGH,
            "critical": LeadPriority.CRITICAL,
        }
        priority = priority_mapping.get(data.get("priority", "medium"), LeadPriority.MEDIUM)

        # Create lead from pre-lead
        lead = Lead(
            first_name=pre_lead.first_name,
            last_name=pre_lead.last_name,
            email=pre_lead.email,
            phone=pre_lead.phone,
            company_name=pre_lead.company_name,
            source=LeadSource.PRE_LEAD,
            source_details=f"Converted from Pre-Lead #{pre_lead_id}",
            priority=priority,
            product_interest=pre_lead.product_interest,
            requirements=pre_lead.requirements,
            city=pre_lead.city,
            state=pre_lead.state,
            country=pre_lead.country,
            address_line1=pre_lead.address_line1,
            address_line2=pre_lead.address_line2,
            zip_code=pre_lead.zip_code,
            notes=data.get("notes") or pre_lead.notes,
            pre_lead_id=pre_lead_id,
            assigned_to=data.get("assigned_to"),
            expected_value=data.get("expected_value"),
            company_id=pre_lead.company_id,
            industry_id=pre_lead.industry_id,
            region_id=pre_lead.region_id,
            office_timings=pre_lead.office_timings,
            timezone=pre_lead.timezone,
        )
        db.add(lead)
        db.flush()

        # Update pre-lead
        pre_lead.is_converted = True
        pre_lead.converted_lead_id = lead.id
        pre_lead.converted_at = datetime.utcnow()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Pre-lead converted to lead successfully",
            "data": {"pre_lead_id": pre_lead_id, "lead_id": lead.id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


# ================== INCOMING WEBHOOKS - LEAD ==================

@router.post("/incoming/lead/create", status_code=status.HTTP_200_OK)
async def webhook_create_lead(
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Create a new lead via webhook

    **Event:** `new_lead`

    **Payload Data Fields:**
    - first_name: str (required)
    - last_name: str
    - email: str
    - phone: str
    - company_name: str
    - source: str (website, referral, social_media, cold_call, walk_in, whatsapp, email, erp, direct, other)
    - priority: str (low, medium, high, critical)
    - product_interest: str
    - requirements: str
    - expected_value: float
    - city, state, country: str
    - address_line1, address_line2, zip_code: str
    - assigned_to: int (user ID)
    - notes: str
    """
    log = log_webhook(db, WebhookDirection.INCOMING, "new_lead", payload.model_dump())

    try:
        data = payload.data

        # Map source
        source_mapping = {
            "website": LeadSource.WEBSITE,
            "referral": LeadSource.REFERRAL,
            "social_media": LeadSource.SOCIAL_MEDIA,
            "cold_call": LeadSource.COLD_CALL,
            "walk_in": LeadSource.WALK_IN,
            "whatsapp": LeadSource.WHATSAPP,
            "email": LeadSource.EMAIL,
            "erp": LeadSource.ERP,
            "direct": LeadSource.DIRECT,
            "other": LeadSource.OTHER,
        }
        source = source_mapping.get(data.get("source", "website"), LeadSource.WEBSITE)

        # Map priority
        priority_mapping = {
            "low": LeadPriority.LOW,
            "medium": LeadPriority.MEDIUM,
            "high": LeadPriority.HIGH,
            "critical": LeadPriority.CRITICAL,
        }
        priority = priority_mapping.get(data.get("priority", "medium"), LeadPriority.MEDIUM)

        lead = Lead(
            first_name=data.get("first_name") or data.get("company_name") or "Unknown",
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            company_name=data.get("company_name"),
            source=source,
            source_details=f"Webhook: {payload.source}",
            priority=priority,
            product_interest=data.get("product_interest"),
            requirements=data.get("requirements"),
            expected_value=data.get("expected_value"),
            city=data.get("city"),
            state=data.get("state"),
            country=data.get("country", "India"),
            address_line1=data.get("address_line1"),
            address_line2=data.get("address_line2"),
            zip_code=data.get("zip_code"),
            assigned_to=data.get("assigned_to"),
            notes=data.get("notes"),
            company_id=data.get("company_id") or 1,
        )
        db.add(lead)
        db.flush()

        log.entity_type = "lead"
        log.entity_id = lead.id
        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Lead created successfully",
            "data": {"lead_id": lead.id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/update", status_code=status.HTTP_200_OK)
async def webhook_update_lead(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Update an existing lead via webhook

    **Event:** `lead_update`

    **Payload Data Fields:** (all optional)
    - first_name, last_name, email, phone: str
    - company_name, designation, company_size: str
    - product_interest, requirements: str
    - expected_value: float
    - city, state, country: str
    - address_line1, address_line2, zip_code: str
    - lead_status: str
    - priority: str (low, medium, high, critical)
    - notes, remarks: str
    """
    log = log_webhook(db, WebhookDirection.INCOMING, "lead_update", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        data = payload.data

        # Update fields if provided
        updatable_fields = [
            'first_name', 'last_name', 'email', 'phone', 'alternate_phone',
            'company_name', 'company_code', 'designation', 'company_size',
            'industry', 'website', 'product_interest', 'requirements',
            'expected_value', 'city', 'state', 'country',
            'address_line1', 'address_line2', 'zip_code', 'pincode',
            'lead_status', 'notes', 'remarks', 'memo',
            'industry_id', 'region_id', 'office_timings', 'timezone',
            'fax', 'phone_no', 'lead_score'
        ]

        for field in updatable_fields:
            if field in data and data[field] is not None:
                setattr(lead, field, data[field])

        # Handle priority separately
        if "priority" in data:
            priority_mapping = {
                "low": LeadPriority.LOW,
                "medium": LeadPriority.MEDIUM,
                "high": LeadPriority.HIGH,
                "critical": LeadPriority.CRITICAL,
            }
            lead.priority = priority_mapping.get(data["priority"], lead.priority)

        lead.updated_at = datetime.utcnow()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Lead updated successfully",
            "data": {"lead_id": lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/discard", status_code=status.HTTP_200_OK)
async def webhook_discard_lead(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Discard a lead via webhook

    **Event:** `lead_discard`

    **Payload Data Fields:**
    - reason: str (optional - reason for discarding)
    - loss_reason: str (optional - specific loss reason)
    """
    log = log_webhook(db, WebhookDirection.INCOMING, "lead_discard", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        lead.status = 1  # 1 = discarded
        if payload.data.get("reason"):
            lead.remarks = payload.data.get("reason")
        if payload.data.get("loss_reason"):
            lead.loss_reason = payload.data.get("loss_reason")
        lead.updated_at = datetime.utcnow()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Lead discarded successfully",
            "data": {"lead_id": lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/contact/add", status_code=status.HTTP_200_OK)
async def webhook_add_lead_contact(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Add a contact to a lead via webhook

    **Event:** `lead_contact_add`

    **Payload Data Fields:**
    - first_name: str (required)
    - last_name: str
    - email: str
    - phone: str
    - designation: str
    - department: str
    - is_primary: bool
    - contact_type: str (primary, billing, technical, decision_maker)
    """
    from app.models.lead_contact import LeadContact

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_contact_add", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        data = payload.data

        contact = LeadContact(
            lead_id=lead_id,
            first_name=data.get("first_name", "Unknown"),
            last_name=data.get("last_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            designation=data.get("designation"),
            department=data.get("department"),
            is_primary=data.get("is_primary", False),
            contact_type=data.get("contact_type", "primary")
        )
        db.add(contact)
        db.flush()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Contact added successfully",
            "data": {"contact_id": contact.id, "lead_id": lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/activity/add", status_code=status.HTTP_200_OK)
async def webhook_add_lead_activity(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Add an activity to a lead via webhook

    **Event:** `lead_activity_add`

    **Payload Data Fields:**
    - activity_type: str (required - call, email, meeting, whatsapp, note, task, follow_up, other)
    - subject: str (required)
    - description: str
    - activity_date: str (ISO date, defaults to today)
    - due_date: str (ISO date)
    - outcome: str
    - is_completed: bool
    """
    from app.models.lead_activity import LeadActivity

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_activity_add", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        data = payload.data

        # Parse activity date
        from datetime import date
        activity_date = date.today()
        if data.get("activity_date"):
            try:
                activity_date = datetime.fromisoformat(data["activity_date"].replace('Z', '+00:00')).date()
            except:
                pass

        due_date = None
        if data.get("due_date"):
            try:
                due_date = datetime.fromisoformat(data["due_date"].replace('Z', '+00:00')).date()
            except:
                pass

        completed_at = None
        is_completed = data.get("is_completed", False)
        if is_completed:
            completed_at = datetime.utcnow()

        activity = LeadActivity(
            lead_id=lead_id,
            activity_type=data.get("activity_type", "note"),
            subject=data.get("subject") or data.get("title", "Activity"),
            description=data.get("description"),
            activity_date=activity_date,
            due_date=due_date,
            outcome=data.get("outcome"),
            is_completed=is_completed,
            completed_at=completed_at
        )
        db.add(activity)
        db.flush()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Activity added successfully",
            "data": {"activity_id": activity.id, "lead_id": lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/qualified-profile/update", status_code=status.HTTP_200_OK)
async def webhook_update_lead_qualified_profile(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Update lead qualified profile via webhook

    **Event:** `lead_qualified_profile_update`

    **Payload Data Fields:**
    - profile_type: str (basic, detailed, enterprise)
    - company_name: str
    - company_type: str
    - industry_id: int
    - annual_revenue: str
    - employee_count: str
    - decision_maker: str
    - decision_process: str
    - budget: str
    - timeline: str
    - competitors: str
    - current_solution: str
    - pain_points: str
    - requirements: str
    - notes: str
    """
    from app.models.lead_qualified_profile import LeadQualifiedProfile

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_qualified_profile_update", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        data = payload.data

        # Find or create profile
        profile = db.query(LeadQualifiedProfile).filter(LeadQualifiedProfile.lead_id == lead_id).first()

        if not profile:
            profile = LeadQualifiedProfile(lead_id=lead_id)
            db.add(profile)

        # Update fields
        updatable_fields = [
            'profile_type', 'company_name', 'company_type', 'industry_id',
            'annual_revenue', 'employee_count', 'decision_maker', 'decision_process',
            'budget', 'timeline', 'competitors', 'current_solution',
            'pain_points', 'requirements', 'notes'
        ]

        for field in updatable_fields:
            if field in data and data[field] is not None:
                setattr(profile, field, data[field])

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Qualified profile updated successfully",
            "data": {"lead_id": lead_id, "profile_id": profile.id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/memo/add", status_code=status.HTTP_200_OK)
async def webhook_add_lead_memo(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Add a memo to a lead via webhook

    **Event:** `lead_memo_add`

    **Payload Data Fields:**
    - title: str (required)
    - content: str (required)
    - memo_type: str (general, meeting_notes, call_notes, internal, important)
    """
    from app.models.lead_memo import LeadMemo

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_memo_add", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        data = payload.data

        memo = LeadMemo(
            lead_id=lead_id,
            title=data.get("title", "Memo"),
            content=data.get("content", ""),
            memo_type=data.get("memo_type", "general")
        )
        db.add(memo)
        db.flush()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Memo added successfully",
            "data": {"memo_id": memo.id, "lead_id": lead_id}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/document/add", status_code=status.HTTP_200_OK)
async def webhook_add_lead_document(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Add a document to a lead via webhook

    **Event:** `lead_document_add`

    **Payload Data Fields:**
    - name: str (required) - Stored filename
    - original_name: str (required) - Original filename uploaded by user
    - file_path: str (required) - Path where file is stored
    - file_type: str (optional) - MIME type or file extension (e.g., "application/pdf", "image/png")
    - size: int (optional) - File size in bytes
    - notes: str (optional) - Additional notes about the document
    - uploaded_by: int (optional) - User ID who uploaded the file
    - company_id: int (optional) - Company ID for tracking
    - pre_lead_id: int (optional) - Pre-lead ID for tracking origin

    **Example Payload:**
    ```json
    {
        "event": "lead_document_add",
        "source": "erp",
        "data": {
            "name": "doc_12345.pdf",
            "original_name": "Contract_Agreement.pdf",
            "file_path": "/uploads/leads/123/doc_12345.pdf",
            "file_type": "application/pdf",
            "size": 1048576,
            "notes": "Signed contract document",
            "uploaded_by": 1,
            "company_id": 1,
            "pre_lead_id": null
        }
    }
    ```
    """
    from app.models.lead_document import LeadDocument

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_document_add", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        data = payload.data

        # Validate required fields
        if not data.get("name"):
            raise HTTPException(status_code=400, detail="name is required")
        if not data.get("original_name"):
            raise HTTPException(status_code=400, detail="original_name is required")
        if not data.get("file_path"):
            raise HTTPException(status_code=400, detail="file_path is required")

        document = LeadDocument(
            lead_id=lead_id,
            name=data.get("name"),
            original_name=data.get("original_name"),
            file_path=data.get("file_path"),
            file_type=data.get("file_type"),
            size=data.get("size"),
            notes=data.get("notes"),
            uploaded_by=data.get("uploaded_by"),
            company_id=data.get("company_id") or lead.company_id,
            pre_lead_id=data.get("pre_lead_id") or lead.pre_lead_id
        )
        db.add(document)
        db.flush()

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Document added successfully",
            "data": {
                "document_id": document.id,
                "lead_id": lead_id,
                "name": document.name,
                "original_name": document.original_name,
                "file_path": document.file_path,
                "file_type": document.file_type,
                "size": document.size
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/document/{document_id}/update", status_code=status.HTTP_200_OK)
async def webhook_update_lead_document(
    lead_id: int,
    document_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Update a lead document via webhook

    **Event:** `lead_document_update`

    **Payload Data Fields:** (all optional)
    - name: str - Stored filename
    - original_name: str - Original filename
    - file_path: str - Path where file is stored
    - file_type: str - MIME type or file extension
    - size: int - File size in bytes
    - notes: str - Additional notes about the document
    - uploaded_by: int - User ID who uploaded the file
    - company_id: int - Company ID for tracking
    - pre_lead_id: int - Pre-lead ID for tracking origin

    **Example Payload:**
    ```json
    {
        "event": "lead_document_update",
        "source": "erp",
        "data": {
            "notes": "Updated contract - Version 2",
            "file_type": "application/pdf",
            "size": 2097152
        }
    }
    ```
    """
    from app.models.lead_document import LeadDocument

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_document_update", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        document = db.query(LeadDocument).filter(
            LeadDocument.id == document_id,
            LeadDocument.lead_id == lead_id
        ).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        data = payload.data

        # Update fields if provided
        updatable_fields = [
            'name', 'original_name', 'file_path', 'file_type',
            'size', 'notes', 'uploaded_by', 'company_id', 'pre_lead_id'
        ]

        for field in updatable_fields:
            if field in data and data[field] is not None:
                setattr(document, field, data[field])

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Document updated successfully",
            "data": {
                "document_id": document.id,
                "lead_id": lead_id,
                "name": document.name,
                "original_name": document.original_name,
                "file_path": document.file_path,
                "file_type": document.file_type,
                "size": document.size,
                "notes": document.notes
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/document/{document_id}/delete", status_code=status.HTTP_200_OK)
async def webhook_delete_lead_document(
    lead_id: int,
    document_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Delete a lead document via webhook

    **Event:** `lead_document_delete`

    **Payload Data Fields:**
    - reason: str (optional) - Reason for deletion

    **Example Payload:**
    ```json
    {
        "event": "lead_document_delete",
        "source": "erp",
        "data": {
            "reason": "Duplicate document"
        }
    }
    ```
    """
    from app.models.lead_document import LeadDocument

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_document_delete", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        document = db.query(LeadDocument).filter(
            LeadDocument.id == document_id,
            LeadDocument.lead_id == lead_id
        ).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        document_info = {
            "document_id": document.id,
            "name": document.name,
            "original_name": document.original_name
        }

        db.delete(document)

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Document deleted successfully",
            "data": document_info
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/status/update", status_code=status.HTTP_200_OK)
async def webhook_update_lead_status(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Update lead status via webhook

    **Event:** `lead_status_update`

    **Payload Data Fields:**
    - lead_status: str (required - new, contacted, qualified, proposal_sent, negotiation, won, lost)
    - remarks: str (optional)
    - status_date: str (optional - ISO date)
    """
    from app.models.lead_status_history import LeadStatusHistory

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_status_update", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        data = payload.data
        old_status = lead.lead_status
        new_status = data.get("lead_status")

        if not new_status:
            raise HTTPException(status_code=400, detail="lead_status is required")

        lead.lead_status = new_status
        lead.updated_at = datetime.utcnow()

        # Parse status date
        from datetime import date
        status_date = date.today()
        if data.get("status_date"):
            try:
                status_date = datetime.fromisoformat(data["status_date"].replace('Z', '+00:00')).date()
            except:
                pass

        # Create status history
        status_history = LeadStatusHistory(
            lead_id=lead_id,
            status=new_status,
            status_date=status_date,
            remarks=data.get("remarks")
        )
        db.add(status_history)

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Lead status updated successfully",
            "data": {"lead_id": lead_id, "old_status": old_status, "new_status": new_status}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/incoming/lead/{lead_id}/convert", status_code=status.HTTP_200_OK)
async def webhook_convert_lead_to_customer(
    lead_id: int,
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Convert lead to customer via webhook

    **Event:** `lead_convert`

    **Payload Data Fields:**
    - customer_code: str (optional - auto-generated if not provided)
    - credit_limit: float
    - payment_terms: str
    - notes: str
    """
    from app.models.customer import Customer, CustomerStatus

    log = log_webhook(db, WebhookDirection.INCOMING, "lead_convert", payload.model_dump(), "lead", lead_id)

    try:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        if lead.is_converted:
            raise HTTPException(status_code=400, detail="Lead already converted")

        data = payload.data

        # Generate customer code if not provided
        customer_code = data.get("customer_code")
        if not customer_code:
            import random
            import string
            customer_code = f"CUST-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"

        # Create customer from lead
        customer = Customer(
            customer_code=customer_code,
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            company_name=lead.company_name,
            industry=lead.industry,
            website=lead.website,
            address=lead.address,
            city=lead.city,
            state=lead.state,
            country=lead.country,
            pincode=lead.pincode,
            status=CustomerStatus.ACTIVE,
            credit_limit=data.get("credit_limit", 0),
            payment_terms=data.get("payment_terms"),
            notes=data.get("notes") or lead.notes,
            lead_id=lead_id,
        )
        db.add(customer)
        db.flush()

        # Update lead
        lead.is_converted = True
        lead.converted_customer_id = customer.id
        lead.converted_at = datetime.utcnow()
        lead.lead_status = "won"

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {
            "status": "success",
            "message": "Lead converted to customer successfully",
            "data": {"lead_id": lead_id, "customer_id": customer.id, "customer_code": customer_code}
        }

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


# ================== GENERIC INCOMING WEBHOOK ==================

@router.post("/incoming", status_code=status.HTTP_200_OK)
async def receive_incoming_webhook(
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Generic incoming webhook endpoint - routes to appropriate handler based on event type

    **Supported Events:**

    **Pre-Lead Events:**
    - `new_inquiry` - Create new pre-lead
    - `pre_lead_update` - Update pre-lead (requires pre_lead_id in data)
    - `pre_lead_discard` - Discard pre-lead (requires pre_lead_id in data)
    - `pre_lead_contact_add` - Add contact to pre-lead
    - `pre_lead_memo_add` - Add memo to pre-lead
    - `pre_lead_status_update` - Update pre-lead status
    - `pre_lead_convert` - Convert pre-lead to lead

    **Lead Events:**
    - `new_lead` - Create new lead
    - `lead_update` - Update lead (requires lead_id in data)
    - `lead_discard` - Discard lead (requires lead_id in data)
    - `lead_contact_add` - Add contact to lead
    - `lead_activity_add` - Add activity to lead
    - `lead_qualified_profile_update` - Update qualified profile
    - `lead_memo_add` - Add memo to lead
    - `lead_status_update` - Update lead status
    - `lead_convert` - Convert lead to customer

    **Other Events:**
    - `order_created` - Update customer order stats
    - `payment_received` - Update customer payment info
    """
    log = WebhookLog(
        direction=WebhookDirection.INCOMING,
        event=WebhookEvent(payload.event) if payload.event in [e.value for e in WebhookEvent] else None,
        method="POST",
        request_payload=payload.model_dump(),
        entity_type=None,
        entity_id=None
    )

    try:
        # Verify signature if provided
        if x_webhook_signature and settings.WEBHOOK_SECRET:
            body = await request.body()
            if not verify_webhook_signature(body, x_webhook_signature, settings.WEBHOOK_SECRET):
                log.is_successful = False
                log.error_message = "Invalid webhook signature"
                db.add(log)
                db.commit()
                raise HTTPException(status_code=401, detail="Invalid signature")

        result = {}
        data = payload.data

        # Pre-Lead Events
        if payload.event == "new_inquiry":
            source_mapping = {
                "website": PreLeadSource.WEBSITE,
                "referral": PreLeadSource.REFERRAL,
                "social_media": PreLeadSource.SOCIAL_MEDIA,
                "cold_call": PreLeadSource.COLD_CALL,
                "walk_in": PreLeadSource.WALK_IN,
                "whatsapp": PreLeadSource.WHATSAPP,
                "email": PreLeadSource.EMAIL,
                "erp": PreLeadSource.ERP,
                "other": PreLeadSource.OTHER,
            }
            source_value = data.get("lead_source") or data.get("source") or payload.source
            source_enum = source_mapping.get(source_value, PreLeadSource.WEBSITE)
            if payload.source == "erp":
                source_enum = PreLeadSource.ERP

            office_timings = data.get("office_timings")
            if not office_timings:
                from_timings = data.get("from_timings")
                to_timings = data.get("to_timings")
                if from_timings and to_timings:
                    office_timings = f"{from_timings} - {to_timings}"

            pre_lead = PreLead(
                first_name=data.get("first_name") or data.get("company_name") or "Unknown",
                last_name=data.get("last_name"),
                email=data.get("email"),
                phone=data.get("phone"),
                company_name=data.get("company_name"),
                source=source_enum,
                source_details=f"Webhook: {payload.source}",
                product_interest=data.get("product_interest"),
                requirements=data.get("requirements"),
                city=data.get("city"),
                state=data.get("state"),
                country=data.get("country", "India"),
                notes=data.get("notes"),
                address_line1=data.get("address_line1") or data.get("address"),
                address_line2=data.get("address_line2"),
                zip_code=data.get("zip_code") or data.get("postal_code"),
                lead_status=data.get("lead_status"),
                industry_id=data.get("industry_id"),
                region_id=data.get("region_id"),
                office_timings=office_timings,
                timezone=data.get("timezone"),
                company_id=data.get("company_id") or 1,
            )
            db.add(pre_lead)
            db.flush()
            log.entity_type = "pre_lead"
            log.entity_id = pre_lead.id
            result = {"pre_lead_id": pre_lead.id}

        elif payload.event == "new_lead":
            source_mapping = {
                "website": LeadSource.WEBSITE,
                "referral": LeadSource.REFERRAL,
                "social_media": LeadSource.SOCIAL_MEDIA,
                "cold_call": LeadSource.COLD_CALL,
                "walk_in": LeadSource.WALK_IN,
                "whatsapp": LeadSource.WHATSAPP,
                "email": LeadSource.EMAIL,
                "erp": LeadSource.ERP,
                "direct": LeadSource.DIRECT,
                "other": LeadSource.OTHER,
            }
            source_value = data.get("lead_source") or data.get("source") or payload.source
            source_enum = source_mapping.get(source_value, LeadSource.WEBSITE)

            priority_mapping = {
                "low": LeadPriority.LOW,
                "medium": LeadPriority.MEDIUM,
                "high": LeadPriority.HIGH,
                "critical": LeadPriority.CRITICAL,
            }
            priority_enum = priority_mapping.get(data.get("priority", "medium").lower(), LeadPriority.MEDIUM)

            lead = Lead(
                first_name=data.get("first_name") or data.get("company_name") or "Unknown",
                last_name=data.get("last_name"),
                email=data.get("email") or data.get("customer_email"),
                phone=data.get("phone") or data.get("contact_phone"),
                company_name=data.get("company_name") or data.get("customer_name"),
                source=source_enum,
                source_details=f"Webhook: {payload.source}",
                priority=priority_enum,
                product_interest=data.get("product_interest"),
                requirements=data.get("requirements"),
                expected_value=data.get("expected_value"),
                city=data.get("city"),
                state=data.get("state"),
                country=data.get("country", "India"),
                notes=data.get("notes"),
                company_id=data.get("company_id") or 1,
            )
            db.add(lead)
            db.flush()
            log.entity_type = "lead"
            log.entity_id = lead.id
            result = {"lead_id": lead.id}

        elif payload.event == "order_created":
            from app.models.customer import Customer
            customer_code = data.get("customer_code")
            if customer_code:
                customer = db.query(Customer).filter(Customer.customer_code == customer_code).first()
                if customer:
                    customer.total_orders = (customer.total_orders or 0) + 1
                    customer.last_order_date = datetime.utcnow()
                    order_value = data.get("order_value", 0)
                    customer.total_revenue = float(customer.total_revenue or 0) + float(order_value)
                    log.entity_type = "customer"
                    log.entity_id = customer.id
                    result = {"customer_id": customer.id}

        elif payload.event == "payment_received":
            from app.models.customer import Customer
            customer_code = data.get("customer_code")
            if customer_code:
                customer = db.query(Customer).filter(Customer.customer_code == customer_code).first()
                if customer:
                    payment_amount = data.get("amount", 0)
                    customer.outstanding_amount = max(0, float(customer.outstanding_amount or 0) - float(payment_amount))
                    log.entity_type = "customer"
                    log.entity_id = customer.id
                    result = {"customer_id": customer.id}

        else:
            raise HTTPException(status_code=400, detail=f"Unknown event type: {payload.event}")

        log.is_successful = True
        log.response_status = 200
        log.processed_at = datetime.utcnow()
        db.add(log)
        db.commit()

        return {"status": "success", "result": result}

    except HTTPException:
        raise
    except Exception as e:
        log.is_successful = False
        log.error_message = str(e)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


# ================== WEBHOOK CONFIGS ==================

@router.post("/configs", response_model=WebhookConfigResponse, status_code=status.HTTP_201_CREATED)
def create_webhook_config(
    config_data: WebhookConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new webhook configuration"""
    if not check_permission(current_user.role, "webhooks", "create"):
        raise HTTPException(status_code=403, detail="Permission denied")

    config = WebhookConfig(**config_data.model_dump())
    db.add(config)
    db.commit()
    db.refresh(config)

    return config


@router.get("/configs", response_model=WebhookConfigListResponse)
def list_webhook_configs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    direction: Optional[WebhookDirection] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List webhook configurations"""
    if not check_permission(current_user.role, "webhooks", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(WebhookConfig)

    if direction:
        query = query.filter(WebhookConfig.direction == direction)

    if is_active is not None:
        query = query.filter(WebhookConfig.is_active == is_active)

    total = query.count()
    offset = (page - 1) * page_size
    configs = query.order_by(WebhookConfig.created_at.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return WebhookConfigListResponse(
        items=configs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/configs/{config_id}", response_model=WebhookConfigResponse)
def get_webhook_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific webhook configuration"""
    if not check_permission(current_user.role, "webhooks", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    config = db.query(WebhookConfig).filter(WebhookConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Webhook config not found")

    return config


@router.put("/configs/{config_id}", response_model=WebhookConfigResponse)
def update_webhook_config(
    config_id: int,
    config_data: WebhookConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a webhook configuration"""
    if not check_permission(current_user.role, "webhooks", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    config = db.query(WebhookConfig).filter(WebhookConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Webhook config not found")

    for field, value in config_data.model_dump(exclude_unset=True).items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)

    return config


@router.delete("/configs/{config_id}")
def delete_webhook_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a webhook configuration"""
    if not check_permission(current_user.role, "webhooks", "delete"):
        raise HTTPException(status_code=403, detail="Permission denied")

    config = db.query(WebhookConfig).filter(WebhookConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Webhook config not found")

    db.delete(config)
    db.commit()

    return {"message": "Webhook config deleted successfully"}


# ================== WEBHOOK LOGS ==================

@router.get("/logs", response_model=WebhookLogListResponse)
def list_webhook_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    direction: Optional[WebhookDirection] = None,
    is_successful: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List webhook logs"""
    if not check_permission(current_user.role, "webhooks", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(WebhookLog)

    if direction:
        query = query.filter(WebhookLog.direction == direction)

    if is_successful is not None:
        query = query.filter(WebhookLog.is_successful == is_successful)

    total = query.count()
    offset = (page - 1) * page_size
    logs = query.order_by(WebhookLog.created_at.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return WebhookLogListResponse(
        items=logs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/logs/{log_id}", response_model=WebhookLogResponse)
def get_webhook_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific webhook log"""
    if not check_permission(current_user.role, "webhooks", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    log = db.query(WebhookLog).filter(WebhookLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Webhook log not found")

    return log

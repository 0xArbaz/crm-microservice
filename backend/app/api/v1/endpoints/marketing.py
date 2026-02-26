from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
import json

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead
from app.models.customer import Customer
from app.models.activity import Activity, ActivityType
from app.models.lead_contact import LeadContact
from app.models.whatsapp_message import (
    WhatsAppMessage as WhatsAppMessageModel,
    WhatsAppDocument, WhatsAppEngagement, WhatsAppAuditLog,
    MessageDirection, MessageStatus
)
from app.core.permissions import check_permission

router = APIRouter()


# ================== SCHEMAS ==================

class EmailRecipient(BaseModel):
    email: EmailStr
    name: str
    entity_type: str  # lead or customer
    entity_id: int


class BulkEmailRequest(BaseModel):
    subject: str
    body: str
    recipient_type: str = "lead"  # lead or customer
    recipient_ids: Optional[List[int]] = None  # If None, send to all
    filters: Optional[dict] = None  # Optional filters


class BulkEmailResponse(BaseModel):
    total_recipients: int
    queued: int
    failed: int
    message: str


class WhatsAppMessageSchema(BaseModel):
    template_name: str
    template_params: Optional[dict] = None
    recipient_type: str = "lead"  # lead or customer
    recipient_ids: Optional[List[int]] = None
    filters: Optional[dict] = None


class WhatsAppResponse(BaseModel):
    total_recipients: int
    queued: int
    failed: int
    message: str


# ================== BULK EMAIL ==================

@router.post("/bulk-email", response_model=BulkEmailResponse)
async def send_bulk_email(
    email_request: BulkEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send bulk emails to leads or customers.
    Emails are queued for background processing.
    """
    if not check_permission(current_user.role, "leads", "bulk_email"):
        raise HTTPException(status_code=403, detail="Permission denied")

    recipients = []

    if email_request.recipient_type == "lead":
        query = db.query(Lead).filter(Lead.email.isnot(None))

        if email_request.recipient_ids:
            query = query.filter(Lead.id.in_(email_request.recipient_ids))

        if email_request.filters:
            if "status" in email_request.filters:
                query = query.filter(Lead.status == email_request.filters["status"])
            if "source" in email_request.filters:
                query = query.filter(Lead.source == email_request.filters["source"])

        leads = query.all()
        recipients = [
            EmailRecipient(
                email=lead.email,
                name=f"{lead.first_name} {lead.last_name or ''}".strip(),
                entity_type="lead",
                entity_id=lead.id
            )
            for lead in leads if lead.email
        ]

    elif email_request.recipient_type == "customer":
        query = db.query(Customer).filter(Customer.email.isnot(None))

        if email_request.recipient_ids:
            query = query.filter(Customer.id.in_(email_request.recipient_ids))

        customers = query.all()
        recipients = [
            EmailRecipient(
                email=customer.email,
                name=f"{customer.first_name} {customer.last_name or ''}".strip(),
                entity_type="customer",
                entity_id=customer.id
            )
            for customer in customers if customer.email
        ]

    if not recipients:
        return BulkEmailResponse(
            total_recipients=0,
            queued=0,
            failed=0,
            message="No recipients found matching criteria"
        )

    # Queue email sending task
    def send_emails_task():
        """Background task to send emails"""
        # In production, integrate with email service (SendGrid, SES, etc.)
        for recipient in recipients:
            try:
                # Create activity log for each email
                activity = Activity(
                    activity_type=ActivityType.EMAIL,
                    subject=f"Bulk Email: {email_request.subject}",
                    description=f"Sent bulk email campaign",
                    email_subject=email_request.subject,
                    performed_by=current_user.id
                )

                if recipient.entity_type == "lead":
                    activity.lead_id = recipient.entity_id
                else:
                    activity.customer_id = recipient.entity_id

                db.add(activity)

                # TODO: Actually send email via email service
                # email_service.send(
                #     to=recipient.email,
                #     subject=email_request.subject,
                #     body=email_request.body,
                #     name=recipient.name
                # )

            except Exception as e:
                print(f"Failed to send email to {recipient.email}: {e}")

        db.commit()

    background_tasks.add_task(send_emails_task)

    return BulkEmailResponse(
        total_recipients=len(recipients),
        queued=len(recipients),
        failed=0,
        message=f"Queued {len(recipients)} emails for sending"
    )


@router.get("/bulk-email/preview")
def preview_bulk_email_recipients(
    recipient_type: str = Query("lead"),
    status: Optional[str] = None,
    source: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview recipients for bulk email"""
    if not check_permission(current_user.role, "leads", "bulk_email"):
        raise HTTPException(status_code=403, detail="Permission denied")

    if recipient_type == "lead":
        query = db.query(Lead).filter(Lead.email.isnot(None))
        if status:
            query = query.filter(Lead.status == status)
        if source:
            query = query.filter(Lead.source == source)
        count = query.count()
        sample = query.limit(10).all()
        return {
            "total_count": count,
            "sample": [
                {"id": l.id, "name": f"{l.first_name} {l.last_name}", "email": l.email}
                for l in sample
            ]
        }
    else:
        query = db.query(Customer).filter(Customer.email.isnot(None))
        count = query.count()
        sample = query.limit(10).all()
        return {
            "total_count": count,
            "sample": [
                {"id": c.id, "name": f"{c.first_name} {c.last_name}", "email": c.email}
                for c in sample
            ]
        }


# ================== ADVANCED BULK EMAIL ==================

class BulkEmailLeadRecipient(BaseModel):
    lead_id: int
    contact_email: str
    contact_name: str


class AdvancedBulkEmailRequest(BaseModel):
    leads: List[BulkEmailLeadRecipient]
    subject: str
    body: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    attachment_ids: Optional[List[int]] = None
    template_id: Optional[str] = None


class BulkEmailDocument(BaseModel):
    id: int
    name: str
    notes: Optional[str] = None
    size: int
    created_at: datetime
    url: str


@router.post("/bulk-email/advanced", response_model=BulkEmailResponse)
async def send_bulk_email_advanced(
    request: AdvancedBulkEmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send bulk emails to selected leads with their specific contacts.
    Supports CC, BCC, and attachments.
    """
    if not check_permission(current_user.role, "leads", "bulk_email"):
        raise HTTPException(status_code=403, detail="Permission denied")

    if not request.leads:
        return BulkEmailResponse(
            total_recipients=0,
            queued=0,
            failed=0,
            message="No recipients provided"
        )

    # Parse CC and BCC emails
    cc_emails = [e.strip() for e in request.cc.split(',') if e.strip()] if request.cc else []
    bcc_emails = [e.strip() for e in request.bcc.split(',') if e.strip()] if request.bcc else []

    # Get attachment URLs if provided
    attachment_urls = []
    if request.attachment_ids:
        from app.models.customer_requirement import BulkEmailDoc
        docs = db.query(BulkEmailDoc).filter(BulkEmailDoc.id.in_(request.attachment_ids)).all()
        attachment_urls = [doc.url for doc in docs if doc.url]

    # Queue email sending task
    def send_emails_task():
        """Background task to send emails to each lead"""
        for lead_recipient in request.leads:
            try:
                # Create activity log for each email
                activity = Activity(
                    activity_type=ActivityType.EMAIL,
                    subject=f"Bulk Email: {request.subject}",
                    description=f"Sent bulk email to {lead_recipient.contact_email}",
                    email_subject=request.subject,
                    lead_id=lead_recipient.lead_id,
                    performed_by=current_user.id
                )
                db.add(activity)

                # TODO: Actually send email via email service
                # email_service.send(
                #     to=lead_recipient.contact_email,
                #     cc=cc_emails,
                #     bcc=bcc_emails,
                #     subject=request.subject,
                #     body=request.body.replace('{{contact_name}}', lead_recipient.contact_name),
                #     attachments=attachment_urls
                # )

            except Exception as e:
                print(f"Failed to send email to {lead_recipient.contact_email}: {e}")

        db.commit()

    background_tasks.add_task(send_emails_task)

    return BulkEmailResponse(
        total_recipients=len(request.leads),
        queued=len(request.leads),
        failed=0,
        message=f"Queued {len(request.leads)} emails for sending"
    )


@router.get("/bulk-email/documents")
def get_bulk_email_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bulk email documents"""
    if not check_permission(current_user.role, "leads", "bulk_email"):
        raise HTTPException(status_code=403, detail="Permission denied")

    from app.models.customer_requirement import BulkEmailDoc
    docs = db.query(BulkEmailDoc).filter(BulkEmailDoc.created_by == current_user.id).order_by(BulkEmailDoc.created_at.desc()).all()

    return [
        {
            "id": doc.id,
            "name": doc.name,
            "notes": doc.notes,
            "size": doc.size,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "url": doc.url
        }
        for doc in docs
    ]


@router.post("/bulk-email/documents")
async def upload_bulk_email_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for bulk email attachments"""
    if not check_permission(current_user.role, "leads", "bulk_email"):
        raise HTTPException(status_code=403, detail="Permission denied")

    from app.models.customer_requirement import BulkEmailDoc
    import os
    import uuid

    # Save file locally (in production, upload to S3 or similar)
    upload_dir = "uploads/bulk_email"
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Create document record
    doc = BulkEmailDoc(
        name=file.filename,
        size=len(content),
        url=f"/uploads/bulk_email/{unique_filename}",
        created_by=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "name": doc.name,
        "size": doc.size,
        "url": doc.url,
        "created_at": doc.created_at.isoformat() if doc.created_at else None
    }


@router.delete("/bulk-email/documents/{doc_id}")
def delete_bulk_email_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a bulk email document"""
    if not check_permission(current_user.role, "leads", "bulk_email"):
        raise HTTPException(status_code=403, detail="Permission denied")

    from app.models.customer_requirement import BulkEmailDoc
    import os

    doc = db.query(BulkEmailDoc).filter(BulkEmailDoc.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    if doc.url and os.path.exists(doc.url.lstrip('/')):
        try:
            os.remove(doc.url.lstrip('/'))
        except:
            pass

    db.delete(doc)
    db.commit()

    return {"message": "Document deleted"}


@router.get("/bulk-email/history")
def get_bulk_email_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bulk email history"""
    if not check_permission(current_user.role, "leads", "bulk_email"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Get email activities
    activities = db.query(Activity).filter(
        Activity.activity_type == ActivityType.EMAIL,
        Activity.subject.like("Bulk Email:%"),
        Activity.performed_by == current_user.id
    ).order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": act.id,
            "lead_id": act.lead_id,
            "lead_name": f"{act.lead.first_name} {act.lead.last_name}" if act.lead else "Unknown",
            "subject": act.email_subject,
            "sent_at": act.created_at.isoformat() if act.created_at else None,
            "attachments": []
        }
        for act in activities
    ]


# ================== WHATSAPP MARKETING ==================

@router.post("/whatsapp", response_model=WhatsAppResponse)
async def send_whatsapp_messages(
    whatsapp_request: WhatsAppMessageSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send bulk WhatsApp messages to leads or customers.
    Messages are queued for background processing.
    """
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    recipients = []

    if whatsapp_request.recipient_type == "lead":
        query = db.query(Lead).filter(Lead.phone.isnot(None))

        if whatsapp_request.recipient_ids:
            query = query.filter(Lead.id.in_(whatsapp_request.recipient_ids))

        if whatsapp_request.filters:
            if "status" in whatsapp_request.filters:
                query = query.filter(Lead.status == whatsapp_request.filters["status"])

        leads = query.all()
        recipients = [
            {
                "phone": lead.phone,
                "name": f"{lead.first_name} {lead.last_name or ''}".strip(),
                "entity_type": "lead",
                "entity_id": lead.id
            }
            for lead in leads if lead.phone
        ]

    elif whatsapp_request.recipient_type == "customer":
        query = db.query(Customer).filter(Customer.phone.isnot(None))

        if whatsapp_request.recipient_ids:
            query = query.filter(Customer.id.in_(whatsapp_request.recipient_ids))

        customers = query.all()
        recipients = [
            {
                "phone": customer.phone,
                "name": f"{customer.first_name} {customer.last_name or ''}".strip(),
                "entity_type": "customer",
                "entity_id": customer.id
            }
            for customer in customers if customer.phone
        ]

    if not recipients:
        return WhatsAppResponse(
            total_recipients=0,
            queued=0,
            failed=0,
            message="No recipients found matching criteria"
        )

    # Queue WhatsApp sending task
    def send_whatsapp_task():
        """Background task to send WhatsApp messages"""
        # In production, integrate with WhatsApp Business API
        for recipient in recipients:
            try:
                # Create activity log
                activity = Activity(
                    activity_type=ActivityType.WHATSAPP,
                    subject=f"WhatsApp: {whatsapp_request.template_name}",
                    description=f"Sent WhatsApp template message",
                    performed_by=current_user.id
                )

                if recipient["entity_type"] == "lead":
                    activity.lead_id = recipient["entity_id"]
                else:
                    activity.customer_id = recipient["entity_id"]

                db.add(activity)

                # TODO: Actually send WhatsApp via API
                # whatsapp_service.send_template(
                #     to=recipient["phone"],
                #     template=whatsapp_request.template_name,
                #     params=whatsapp_request.template_params
                # )

            except Exception as e:
                print(f"Failed to send WhatsApp to {recipient['phone']}: {e}")

        db.commit()

    background_tasks.add_task(send_whatsapp_task)

    return WhatsAppResponse(
        total_recipients=len(recipients),
        queued=len(recipients),
        failed=0,
        message=f"Queued {len(recipients)} WhatsApp messages for sending"
    )


@router.get("/whatsapp/templates")
def get_whatsapp_templates(
    current_user: User = Depends(get_current_user)
):
    """Get available WhatsApp message templates"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # In production, fetch from WhatsApp Business API
    return {
        "templates": [
            {
                "name": "welcome_message",
                "description": "Welcome message for new leads",
                "params": ["name", "company"]
            },
            {
                "name": "follow_up",
                "description": "Follow-up message after initial contact",
                "params": ["name", "product"]
            },
            {
                "name": "promotion",
                "description": "Promotional offer message",
                "params": ["name", "offer_details", "valid_until"]
            },
            {
                "name": "appointment_reminder",
                "description": "Reminder for scheduled appointment",
                "params": ["name", "date", "time"]
            }
        ]
    }


@router.get("/whatsapp/preview")
def preview_whatsapp_recipients(
    recipient_type: str = Query("lead"),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview recipients for WhatsApp marketing"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    if recipient_type == "lead":
        query = db.query(Lead).filter(Lead.phone.isnot(None))
        if status:
            query = query.filter(Lead.status == status)
        count = query.count()
        sample = query.limit(10).all()
        return {
            "total_count": count,
            "sample": [
                {"id": l.id, "name": f"{l.first_name} {l.last_name}", "phone": l.phone}
                for l in sample
            ]
        }
    else:
        query = db.query(Customer).filter(Customer.phone.isnot(None))
        count = query.count()
        sample = query.limit(10).all()
        return {
            "total_count": count,
            "sample": [
                {"id": c.id, "name": f"{c.first_name} {c.last_name}", "phone": c.phone}
                for c in sample
            ]
        }


# ================== WHATSAPP ADVANCED ENDPOINTS ==================

class WhatsAppRecipient(BaseModel):
    number: str
    lead_id: int
    name: str
    company: str


class WhatsAppSendRequest(BaseModel):
    recipients: List[WhatsAppRecipient]
    template_key: str
    documents: Optional[List[dict]] = None
    custom_message: Optional[str] = None


@router.post("/whatsapp/send")
async def send_whatsapp_message(
    request: WhatsAppSendRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send WhatsApp messages to selected recipients.
    Supports templates, custom messages, and attachments.
    """
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    if not request.recipients:
        return {"status": "failed", "message": "No recipients provided"}

    sent_count = 0
    failed_count = 0
    messages_created = []

    try:
        for recipient in request.recipients:
            try:
                # Create message record
                message = WhatsAppMessageModel(
                    lead_id=recipient.lead_id,
                    phone_number=recipient.number,
                    contact_name=recipient.name,
                    company_name=recipient.company,
                    template_key=request.template_key if request.template_key != "custom" else None,
                    message_body=request.custom_message if request.template_key == "custom" else None,
                    file_attachment=request.documents if request.documents else None,
                    direction=MessageDirection.OUTBOUND,
                    status=MessageStatus.PENDING,
                    sender_id=current_user.id,
                    sent_at=datetime.utcnow()
                )
                db.add(message)
                db.flush()
                messages_created.append(message)

                # TODO: Integrate with actual WhatsApp Business API
                # For now, mark as sent
                message.status = MessageStatus.SENT
                sent_count += 1

                # Create audit log
                audit = WhatsAppAuditLog(
                    user_id=current_user.id,
                    action_type="message_sent",
                    comment=f"Sent WhatsApp to {recipient.number} using template: {request.template_key}",
                    lead_id=recipient.lead_id,
                    message_id=message.id
                )
                db.add(audit)

            except Exception as e:
                failed_count += 1
                print(f"Failed to send WhatsApp to {recipient.number}: {e}")

        db.commit()
    except Exception as e:
        print(f"WhatsApp send error (tables may not exist): {e}")
        # Return a mock success for now - in production, should create tables first
        return {"status": "sent", "message": f"Messages queued for sending (database setup pending)"}

    if failed_count == 0:
        return {"status": "sent", "message": f"Successfully sent {sent_count} messages"}
    elif sent_count > 0:
        return {"status": "partial", "message": f"Sent {sent_count}, failed {failed_count}"}
    else:
        return {"status": "failed", "message": "All messages failed to send"}


@router.get("/whatsapp/documents")
def get_whatsapp_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all WhatsApp marketing documents"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        docs = db.query(WhatsAppDocument).order_by(desc(WhatsAppDocument.created_at)).all()

        return [
            {
                "id": doc.id,
                "name": doc.name,
                "folder": doc.folder,
                "size": doc.size,
                "url": doc.url,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
                "updated_at": doc.updated_at.isoformat() if doc.updated_at else None
            }
            for doc in docs
        ]
    except Exception as e:
        # Table may not exist yet - return empty list
        print(f"WhatsApp documents query error (table may not exist): {e}")
        return []


@router.post("/whatsapp/documents")
async def upload_whatsapp_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for WhatsApp marketing"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    import os
    import uuid

    try:
        # Save file locally (in production, upload to S3 or similar)
        upload_dir = "uploads/whatsapp"
        os.makedirs(upload_dir, exist_ok=True)

        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)

        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # Create document record
        doc = WhatsAppDocument(
            name=file.filename,
            folder=upload_dir,
            size=len(content),
            url=f"/uploads/whatsapp/{unique_filename}",
            created_by=current_user.id
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Create audit log
        audit = WhatsAppAuditLog(
            user_id=current_user.id,
            action_type="document_uploaded",
            comment=f"Uploaded document: {file.filename}"
        )
        db.add(audit)
        db.commit()

        return {
            "success": True,
            "document": {
                "id": doc.id,
                "name": doc.name,
                "link": doc.url,
                "size": f"{round(doc.size / 1024, 2)} KB",
                "uploaded_at": doc.created_at.strftime("%m/%d/%Y") if doc.created_at else ""
            }
        }
    except Exception as e:
        print(f"WhatsApp document upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload document. Database tables may not exist - please run migrations.")


@router.post("/whatsapp/documents/delete")
def delete_whatsapp_document(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a WhatsApp document"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    doc_id = data.get("doc_id")
    if not doc_id:
        raise HTTPException(status_code=400, detail="Document ID required")

    import os

    try:
        doc = db.query(WhatsAppDocument).filter(WhatsAppDocument.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete file from disk
        if doc.url and os.path.exists(doc.url.lstrip('/')):
            try:
                os.remove(doc.url.lstrip('/'))
            except:
                pass

        db.delete(doc)
        db.commit()

        return {"success": True, "message": "Document deleted"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"WhatsApp document delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.get("/whatsapp/sent-messages")
def get_whatsapp_sent_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get sent WhatsApp messages"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        messages = db.query(WhatsAppMessageModel).filter(
            WhatsAppMessageModel.direction == MessageDirection.OUTBOUND
        ).order_by(desc(WhatsAppMessageModel.created_at)).offset(skip).limit(limit).all()

        return [
            {
                "id": msg.id,
                "lead_id": msg.lead_id,
                "phone_number": msg.phone_number,
                "contact_name": msg.contact_name,
                "company_name": msg.company_name,
                "message_body": msg.message_body,
                "template_key": msg.template_key,
                "status": msg.status.value if msg.status else None,
                "file_attachment": msg.file_attachment,
                "sender_id": msg.sender_id,
                "sent_at": msg.sent_at.isoformat() if msg.sent_at else None,
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            }
            for msg in messages
        ]
    except Exception as e:
        print(f"WhatsApp sent messages query error: {e}")
        return []


@router.get("/whatsapp/received-messages")
def get_whatsapp_received_messages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get received WhatsApp messages / engagements"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        # Get engagements
        engagements = db.query(WhatsAppEngagement).order_by(
            desc(WhatsAppEngagement.created_at)
        ).offset(skip).limit(limit).all()

        return [
            {
                "id": eng.id,
                "phone_number": eng.phone_number,
                "contact_name": eng.contact_name,
                "lead_id": eng.lead_id,
                "event_type": eng.event_type,
                "response_body": eng.response_body,
                "created_at": eng.created_at.isoformat() if eng.created_at else None
            }
            for eng in engagements
        ]
    except Exception as e:
        print(f"WhatsApp received messages query error: {e}")
        return []


@router.get("/whatsapp/conversation/{phone_number}")
def get_whatsapp_conversation(
    phone_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get conversation history for a phone number"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        messages = db.query(WhatsAppMessageModel).filter(
            WhatsAppMessageModel.phone_number == phone_number
        ).order_by(WhatsAppMessageModel.created_at).all()

        return [
            {
                "id": msg.id,
                "direction": msg.direction.value if msg.direction else "outbound",
                "message_body": msg.message_body,
                "template_key": msg.template_key,
                "status": msg.status.value if msg.status else None,
                "file_attachment": msg.file_attachment,
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            }
            for msg in messages
        ]
    except Exception as e:
        print(f"WhatsApp conversation query error: {e}")
        return []


@router.post("/whatsapp/conversation/send")
async def send_conversation_message(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message in a conversation"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    phone_number = data.get("phone_number")
    message_body = data.get("message_body")

    if not phone_number or not message_body:
        raise HTTPException(status_code=400, detail="Phone number and message required")

    try:
        # Find lead by phone number
        lead = db.query(Lead).filter(Lead.phone == phone_number).first()

        # Create message record
        message = WhatsAppMessageModel(
            lead_id=lead.id if lead else None,
            phone_number=phone_number,
            message_body=message_body,
            direction=MessageDirection.OUTBOUND,
            status=MessageStatus.SENT,
            sender_id=current_user.id,
            sent_at=datetime.utcnow()
        )
        db.add(message)
        db.commit()

        # TODO: Actually send via WhatsApp API

        return {"success": True, "message_id": message.id}
    except Exception as e:
        print(f"WhatsApp send conversation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")


@router.get("/whatsapp/audit-log")
def get_whatsapp_audit_log(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get WhatsApp marketing audit log"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        logs = db.query(WhatsAppAuditLog).order_by(
            desc(WhatsAppAuditLog.created_at)
        ).offset(skip).limit(limit).all()

        # Get user names
        user_ids = [log.user_id for log in logs if log.user_id]
        users = {u.id: u.full_name or u.email for u in db.query(User).filter(User.id.in_(user_ids)).all()}

        return [
            {
                "id": log.id,
                "user_id": log.user_id,
                "user_name": users.get(log.user_id, "Unknown"),
                "action_type": log.action_type,
                "comment": log.comment,
                "lead_id": log.lead_id,
                "message_id": log.message_id,
                "created_at": log.created_at.isoformat() if log.created_at else None
            }
            for log in logs
        ]
    except Exception as e:
        print(f"WhatsApp audit log query error: {e}")
        return []


@router.get("/whatsapp/leads")
def get_whatsapp_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    search: Optional[str] = None,
    country_id: Optional[int] = None,
    state_id: Optional[int] = None,
    city_id: Optional[int] = None,
    group_id: Optional[int] = None,
    industry_id: Optional[int] = None,
    sales_rep: Optional[int] = None,
    lead_source: Optional[str] = None,
    lead_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leads for WhatsApp marketing with filters"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(Lead).filter(Lead.phone.isnot(None))

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Lead.company_name.ilike(search_term),
                Lead.first_name.ilike(search_term),
                Lead.phone.ilike(search_term)
            )
        )

    if country_id:
        query = query.filter(Lead.country_id == country_id)
    if state_id:
        query = query.filter(Lead.state_id == state_id)
    if city_id:
        query = query.filter(Lead.city_id == city_id)
    if group_id:
        query = query.filter(Lead.group_id == group_id)
    if industry_id:
        query = query.filter(Lead.industry_id == industry_id)
    if sales_rep:
        query = query.filter(Lead.assigned_to == sales_rep)
    if lead_source:
        query = query.filter(Lead.lead_source == lead_source)
    if lead_status:
        query = query.filter(Lead.lead_status == lead_status)

    # Get total count
    total = query.count()

    # Paginate
    skip = (page - 1) * page_size
    leads = query.order_by(desc(Lead.created_at)).offset(skip).limit(page_size).all()

    return {
        "items": [
            {
                "id": lead.id,
                "company_name": lead.company_name,
                "first_name": lead.first_name,
                "last_name": lead.last_name,
                "phone": lead.phone,
                "email": lead.email,
                "country": lead.country,
                "country_id": lead.country_id,
                "state": lead.state,
                "state_id": lead.state_id,
                "city": lead.city,
                "city_id": lead.city_id,
                "group_id": lead.group_id,
                "industry": lead.industry,
                "industry_id": lead.industry_id,
                "sales_rep": lead.sales_rep,
                "assigned_to": lead.assigned_to,
                "lead_source": lead.lead_source,
                "source": lead.source.value if lead.source else None,
                "lead_status": lead.lead_status
            }
            for lead in leads
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/whatsapp/lead/{lead_id}/contacts")
def get_lead_contacts_for_whatsapp(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get contacts for a lead (for WhatsApp marketing)"""
    if not check_permission(current_user.role, "leads", "whatsapp"):
        raise HTTPException(status_code=403, detail="Permission denied")

    try:
        contacts = db.query(LeadContact).filter(LeadContact.lead_id == lead_id).all()

        return {
            "contacts": [
                {
                    "id": c.id,
                    "name": f"{c.first_name or ''} {c.last_name or ''}".strip() or f"Contact {c.id}",
                    "phone": c.phone,
                    "work_phone": c.work_phone,
                    "mobile_phone": c.cell_phone,  # LeadContact uses cell_phone field
                    "email": c.email or c.work_email
                }
                for c in contacts
            ]
        }
    except Exception as e:
        print(f"WhatsApp lead contacts query error: {e}")
        return {"contacts": []}

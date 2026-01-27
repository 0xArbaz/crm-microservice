from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead, LeadStatus
from app.models.customer import Customer
from app.models.activity import Activity, ActivityType
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


class WhatsAppMessage(BaseModel):
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


# ================== WHATSAPP MARKETING ==================

@router.post("/whatsapp", response_model=WhatsAppResponse)
async def send_whatsapp_messages(
    whatsapp_request: WhatsAppMessage,
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

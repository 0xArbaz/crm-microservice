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


# ================== INCOMING WEBHOOKS ==================

@router.post("/incoming", status_code=status.HTTP_200_OK)
async def receive_incoming_webhook(
    request: Request,
    payload: IncomingWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Receive incoming webhooks from external systems (ERP, website forms, etc.)

    Supported events:
    - new_inquiry: Create a new pre-lead
    - order_created: Update customer order stats
    - payment_received: Update customer payment info
    """
    # Log the incoming webhook
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

        # Process based on event type
        result = {}

        if payload.event == "new_inquiry":
            # Create pre-lead from incoming data
            data = payload.data
            pre_lead = PreLead(
                first_name=data.get("first_name", "Unknown"),
                last_name=data.get("last_name"),
                email=data.get("email"),
                phone=data.get("phone"),
                company_name=data.get("company_name"),
                source=PreLeadSource.ERP if payload.source == "erp" else PreLeadSource.WEBSITE,
                source_details=f"Webhook: {payload.source}",
                product_interest=data.get("product_interest"),
                requirements=data.get("requirements"),
                city=data.get("city"),
                state=data.get("state"),
                country=data.get("country", "India"),
                notes=data.get("notes")
            )
            db.add(pre_lead)
            db.flush()

            log.entity_type = "pre_lead"
            log.entity_id = pre_lead.id
            result = {"pre_lead_id": pre_lead.id}

        elif payload.event == "order_created":
            # Update customer order stats
            from app.models.customer import Customer
            customer_code = payload.data.get("customer_code")
            if customer_code:
                customer = db.query(Customer).filter(
                    Customer.customer_code == customer_code
                ).first()
                if customer:
                    customer.total_orders = (customer.total_orders or 0) + 1
                    customer.last_order_date = datetime.utcnow()
                    order_value = payload.data.get("order_value", 0)
                    customer.total_revenue = float(customer.total_revenue or 0) + float(order_value)

                    log.entity_type = "customer"
                    log.entity_id = customer.id
                    result = {"customer_id": customer.id}

        elif payload.event == "payment_received":
            # Update customer payment info
            from app.models.customer import Customer
            customer_code = payload.data.get("customer_code")
            if customer_code:
                customer = db.query(Customer).filter(
                    Customer.customer_code == customer_code
                ).first()
                if customer:
                    payment_amount = payload.data.get("amount", 0)
                    customer.outstanding_amount = max(
                        0,
                        float(customer.outstanding_amount or 0) - float(payment_amount)
                    )
                    log.entity_type = "customer"
                    log.entity_id = customer.id
                    result = {"customer_id": customer.id}

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

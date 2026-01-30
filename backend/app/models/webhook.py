from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, JSON
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class WebhookDirection(str, enum.Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"


class WebhookEvent(str, enum.Enum):
    # Incoming events - General
    NEW_INQUIRY = "new_inquiry"
    ORDER_CREATED = "order_created"
    PAYMENT_RECEIVED = "payment_received"
    SUPPORT_TICKET = "support_ticket"

    # Incoming events - Pre-Lead
    PRE_LEAD_UPDATE = "pre_lead_update"
    PRE_LEAD_DISCARD = "pre_lead_discard"
    PRE_LEAD_CONTACT_ADD = "pre_lead_contact_add"
    PRE_LEAD_CONTACT_UPDATE = "pre_lead_contact_update"
    PRE_LEAD_CONTACT_DELETE = "pre_lead_contact_delete"
    PRE_LEAD_MEMO_ADD = "pre_lead_memo_add"
    PRE_LEAD_MEMO_UPDATE = "pre_lead_memo_update"
    PRE_LEAD_MEMO_DELETE = "pre_lead_memo_delete"
    PRE_LEAD_DOCUMENT_ADD = "pre_lead_document_add"
    PRE_LEAD_DOCUMENT_DELETE = "pre_lead_document_delete"
    PRE_LEAD_STATUS_UPDATE = "pre_lead_status_update"
    PRE_LEAD_CONVERT = "pre_lead_convert"

    # Incoming events - Lead
    NEW_LEAD = "new_lead"
    LEAD_UPDATE = "lead_update"
    LEAD_DISCARD = "lead_discard"
    LEAD_CONTACT_ADD = "lead_contact_add"
    LEAD_CONTACT_UPDATE = "lead_contact_update"
    LEAD_CONTACT_DELETE = "lead_contact_delete"
    LEAD_ACTIVITY_ADD = "lead_activity_add"
    LEAD_ACTIVITY_UPDATE = "lead_activity_update"
    LEAD_ACTIVITY_DELETE = "lead_activity_delete"
    LEAD_QUALIFIED_PROFILE_UPDATE = "lead_qualified_profile_update"
    LEAD_MEMO_ADD = "lead_memo_add"
    LEAD_MEMO_UPDATE = "lead_memo_update"
    LEAD_MEMO_DELETE = "lead_memo_delete"
    LEAD_DOCUMENT_ADD = "lead_document_add"
    LEAD_DOCUMENT_DELETE = "lead_document_delete"
    LEAD_STATUS_UPDATE = "lead_status_update"
    LEAD_CONVERT = "lead_convert"

    # Outgoing events
    PRE_LEAD_CREATED = "pre_lead_created"
    LEAD_VALIDATED = "lead_validated"
    LEAD_CONVERTED = "lead_converted"
    CUSTOMER_CREATED = "customer_created"
    LEAD_STATUS_CHANGED = "lead_status_changed"


class WebhookConfig(Base):
    """Configuration for webhook endpoints"""
    __tablename__ = "webhook_configs"

    id = Column(Integer, primary_key=True, index=True)

    # Webhook Details
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    direction = Column(Enum(WebhookDirection), nullable=False)
    event = Column(Enum(WebhookEvent), nullable=False)

    # URL (for outgoing webhooks)
    url = Column(String(500), nullable=True)

    # Authentication
    secret_key = Column(String(255), nullable=True)
    auth_header = Column(String(100), nullable=True)
    auth_value = Column(String(255), nullable=True)

    # Configuration
    is_active = Column(Boolean, default=True)
    retry_count = Column(Integer, default=3)
    timeout_seconds = Column(Integer, default=30)

    # Headers and payload template
    headers = Column(JSON, nullable=True)
    payload_template = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<WebhookConfig {self.name} - {self.direction}>"


class WebhookLog(Base):
    """Log of webhook executions"""
    __tablename__ = "webhook_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Reference to config
    webhook_config_id = Column(Integer, nullable=True)

    # Request Details
    direction = Column(Enum(WebhookDirection), nullable=False)
    event = Column(Enum(WebhookEvent), nullable=True)
    url = Column(String(500), nullable=True)
    method = Column(String(10), default="POST")

    # Payload
    request_headers = Column(JSON, nullable=True)
    request_payload = Column(JSON, nullable=True)

    # Response
    response_status = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)

    # Status
    is_successful = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)

    # Related entity
    entity_type = Column(String(50), nullable=True)  # pre_lead, lead, customer
    entity_id = Column(Integer, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<WebhookLog {self.direction} - {self.event}>"

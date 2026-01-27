from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, JSON
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class WebhookDirection(str, enum.Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"


class WebhookEvent(str, enum.Enum):
    # Incoming events
    NEW_INQUIRY = "new_inquiry"
    ORDER_CREATED = "order_created"
    PAYMENT_RECEIVED = "payment_received"
    SUPPORT_TICKET = "support_ticket"

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

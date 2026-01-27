from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.webhook import WebhookDirection, WebhookEvent


class WebhookConfigBase(BaseModel):
    name: str
    description: Optional[str] = None
    direction: WebhookDirection
    event: WebhookEvent
    url: Optional[str] = None
    secret_key: Optional[str] = None
    auth_header: Optional[str] = None
    auth_value: Optional[str] = None
    is_active: bool = True
    retry_count: int = 3
    timeout_seconds: int = 30
    headers: Optional[Dict[str, str]] = None
    payload_template: Optional[str] = None


class WebhookConfigCreate(WebhookConfigBase):
    pass


class WebhookConfigUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    secret_key: Optional[str] = None
    auth_header: Optional[str] = None
    auth_value: Optional[str] = None
    is_active: Optional[bool] = None
    retry_count: Optional[int] = None
    timeout_seconds: Optional[int] = None
    headers: Optional[Dict[str, str]] = None
    payload_template: Optional[str] = None


class WebhookConfigResponse(WebhookConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WebhookLogResponse(BaseModel):
    id: int
    webhook_config_id: Optional[int] = None
    direction: WebhookDirection
    event: Optional[WebhookEvent] = None
    url: Optional[str] = None
    method: str
    request_headers: Optional[Dict[str, Any]] = None
    request_payload: Optional[Dict[str, Any]] = None
    response_status: Optional[int] = None
    response_body: Optional[str] = None
    is_successful: bool
    error_message: Optional[str] = None
    retry_count: int
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class IncomingWebhookPayload(BaseModel):
    """Schema for incoming webhooks from ERP/external systems"""
    event: str
    source: str = "external"
    data: Dict[str, Any]
    timestamp: Optional[datetime] = None
    signature: Optional[str] = None  # HMAC signature for verification


class WebhookConfigListResponse(BaseModel):
    items: list[WebhookConfigResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class WebhookLogListResponse(BaseModel):
    items: list[WebhookLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

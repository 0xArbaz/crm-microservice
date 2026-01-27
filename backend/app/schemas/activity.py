from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.activity import ActivityType, ActivityOutcome


class ActivityBase(BaseModel):
    activity_type: ActivityType
    subject: str
    description: Optional[str] = None
    outcome: Optional[ActivityOutcome] = None
    activity_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    scheduled_date: Optional[datetime] = None
    call_direction: Optional[str] = None
    call_recording_url: Optional[str] = None
    email_subject: Optional[str] = None
    document_name: Optional[str] = None
    document_url: Optional[str] = None


class ActivityCreate(ActivityBase):
    lead_id: Optional[int] = None
    customer_id: Optional[int] = None


class ActivityUpdate(BaseModel):
    activity_type: Optional[ActivityType] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    outcome: Optional[ActivityOutcome] = None
    activity_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    scheduled_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    call_direction: Optional[str] = None
    call_recording_url: Optional[str] = None
    email_subject: Optional[str] = None
    email_opened: Optional[bool] = None
    email_clicked: Optional[bool] = None
    document_name: Optional[str] = None
    document_url: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    email_opened: bool
    email_clicked: bool
    lead_id: Optional[int] = None
    customer_id: Optional[int] = None
    performed_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ActivityListResponse(BaseModel):
    items: list[ActivityResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

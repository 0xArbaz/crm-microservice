from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ActivityType(str, enum.Enum):
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"
    WHATSAPP = "whatsapp"
    NOTE = "note"
    TASK = "task"
    FOLLOW_UP = "follow_up"
    STATUS_CHANGE = "status_change"
    DOCUMENT = "document"
    OTHER = "other"


class ActivityOutcome(str, enum.Enum):
    SUCCESSFUL = "successful"
    NO_ANSWER = "no_answer"
    CALLBACK_REQUESTED = "callback_requested"
    NOT_INTERESTED = "not_interested"
    FOLLOW_UP_NEEDED = "follow_up_needed"
    MEETING_SCHEDULED = "meeting_scheduled"
    PENDING = "pending"
    OTHER = "other"


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    # Activity Details
    activity_type = Column(Enum(ActivityType), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    outcome = Column(Enum(ActivityOutcome), nullable=True)

    # Timing
    activity_date = Column(DateTime(timezone=True), server_default=func.now())
    duration_minutes = Column(Integer, nullable=True)

    # Scheduling (for tasks/follow-ups)
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Call specific
    call_direction = Column(String(20), nullable=True)  # inbound, outbound
    call_recording_url = Column(String(500), nullable=True)

    # Email specific
    email_subject = Column(String(255), nullable=True)
    email_opened = Column(Boolean, default=False)
    email_clicked = Column(Boolean, default=False)

    # Document specific
    document_name = Column(String(255), nullable=True)
    document_url = Column(String(500), nullable=True)

    # Linked Entity (Either Lead OR Customer)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)

    # User who performed the activity
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="activities", foreign_keys=[lead_id])
    customer = relationship("Customer", back_populates="activities", foreign_keys=[customer_id])
    user = relationship("User", foreign_keys=[performed_by])

    def __repr__(self):
        return f"<Activity {self.activity_type} - {self.subject}>"

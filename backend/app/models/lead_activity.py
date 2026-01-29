from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LeadActivity(Base):
    __tablename__ = "lead_activities"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)

    # Activity Details
    activity_type = Column(String(50), nullable=False)  # call, email, meeting, whatsapp, note, task, follow_up, other
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    outcome = Column(Text, nullable=True)

    # Dates
    activity_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)

    # Status
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Related Contact
    contact_id = Column(Integer, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)
    performed_by = Column(Integer, nullable=True)

    # Relationship
    lead = relationship("Lead", backref="lead_activities")

    def __repr__(self):
        return f"<LeadActivity {self.activity_type}: {self.subject}>"

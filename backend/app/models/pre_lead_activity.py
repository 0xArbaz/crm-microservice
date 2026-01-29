from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PreLeadActivity(Base):
    __tablename__ = "pre_lead_activities"

    id = Column(Integer, primary_key=True, index=True)
    pre_lead_id = Column(Integer, ForeignKey("pre_leads.id"), nullable=False, index=True)
    contact_id = Column(Integer, ForeignKey("pre_lead_contacts.id"), nullable=True)

    # Activity Details
    activity_type = Column(String(50), nullable=False)  # call, email, meeting, fax, visit
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Scheduling
    start_date = Column(Date, nullable=True)
    start_time = Column(String(20), nullable=True)
    due_date = Column(Date, nullable=True)
    due_time = Column(String(20), nullable=True)

    # Priority & Status
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    status = Column(String(50), default="pending")  # pending, in_progress, completed, cancelled
    category = Column(String(50), nullable=True)

    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Location (for visits)
    location = Column(String(255), nullable=True)

    # Contact info for the activity
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    fax_no = Column(String(50), nullable=True)

    # Checklist (for activity checklists)
    activity_checklist = Column(Integer, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    # Relationships
    pre_lead = relationship("PreLead", backref="activities")
    contact = relationship("PreLeadContact", backref="activities")
    assigned_user = relationship("User", foreign_keys=[assigned_to])

    def __repr__(self):
        return f"<PreLeadActivity {self.activity_type} - {self.subject}>"

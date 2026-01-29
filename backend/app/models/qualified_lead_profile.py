from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class QualifiedLeadProfile(Base):
    __tablename__ = "qualified_lead_profiles"

    id = Column(Integer, primary_key=True, index=True)
    pre_lead_id = Column(Integer, ForeignKey("pre_leads.id"), nullable=False, index=True)
    contact_id = Column(Integer, ForeignKey("pre_lead_contacts.id"), nullable=True)

    # Basic Info (Auto-filled from pre-lead)
    company_name = Column(String(255), nullable=True)
    industry_id = Column(Integer, nullable=True)

    # Contact Info
    best_time_call = Column(String(50), nullable=True)
    best_time_call_timezone = Column(Integer, nullable=True)
    mode = Column(String(50), nullable=True)  # Email, Phone, Visit

    # Contact Details (Auto-filled when contact is selected)
    contact_name = Column(String(255), nullable=True)
    designation = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)

    # Additional Information
    need_type = Column(Integer, nullable=True)  # Dropdown value
    current_software = Column(String(255), nullable=True)
    need_summary = Column(Text, nullable=True)
    budget = Column(Integer, nullable=True)  # Dropdown value
    decision_maker = Column(Integer, nullable=True)  # Contact ID
    time_frame = Column(Integer, nullable=True)  # Dropdown value
    qualified_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Rich Text Fields
    company_profile = Column(Text, nullable=True)
    summary_of_discussion = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)

    # Status
    status = Column(String(20), default="draft")  # draft, submitted

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    # Relationships
    pre_lead = relationship("PreLead", backref="qualified_profiles")
    contact = relationship("PreLeadContact", backref="qualified_profiles")
    qualifier = relationship("User", foreign_keys=[qualified_by])

    def __repr__(self):
        return f"<QualifiedLeadProfile {self.id}>"

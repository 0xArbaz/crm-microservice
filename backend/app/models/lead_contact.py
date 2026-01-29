from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LeadContact(Base):
    __tablename__ = "lead_contacts"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)

    # Contact Type
    contact_type = Column(String(50), default="primary")  # primary, billing, technical, decision_maker, etc.

    # Basic Information
    title = Column(String(20), nullable=True)  # Mr., Mrs., Ms., Dr.
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    is_primary = Column(Boolean, default=False)

    # Contact Details
    email = Column(String(255), nullable=True)
    work_email = Column(String(255), nullable=True)
    personal_email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    work_phone = Column(String(50), nullable=True)
    ext = Column(String(20), nullable=True)
    fax = Column(String(50), nullable=True)
    cell_phone = Column(String(50), nullable=True)
    home_phone = Column(String(50), nullable=True)

    # Social Media Links
    linkedin_url = Column(String(255), nullable=True)
    facebook_url = Column(String(255), nullable=True)
    twitter_url = Column(String(255), nullable=True)

    # Profile Image
    image = Column(String(255), nullable=True)

    # Status
    status = Column(String(20), default="active")  # active, inactive

    # Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    # Relationship
    lead = relationship("Lead", backref="lead_contacts")

    def __repr__(self):
        return f"<LeadContact {self.first_name} {self.last_name}>"

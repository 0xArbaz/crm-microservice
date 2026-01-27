from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class PreLeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    VALIDATED = "validated"
    DISCARDED = "discarded"


class PreLeadSource(str, enum.Enum):
    WEBSITE = "website"
    REFERRAL = "referral"
    SOCIAL_MEDIA = "social_media"
    COLD_CALL = "cold_call"
    WALK_IN = "walk_in"
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    ERP = "erp"
    OTHER = "other"


class PreLead(Base):
    __tablename__ = "pre_leads"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True, index=True)
    alternate_phone = Column(String(20), nullable=True)

    # Company Information
    company_name = Column(String(255), nullable=True)
    designation = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)

    # Lead Details
    source = Column(Enum(PreLeadSource), default=PreLeadSource.WEBSITE, nullable=False)
    source_details = Column(String(255), nullable=True)  # Campaign name, referrer name, etc.
    status = Column(Enum(PreLeadStatus), default=PreLeadStatus.NEW, nullable=False)

    # Interest & Requirements
    product_interest = Column(String(255), nullable=True)
    requirements = Column(Text, nullable=True)
    budget_range = Column(String(100), nullable=True)

    # Location
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")

    # Notes
    notes = Column(Text, nullable=True)
    discard_reason = Column(Text, nullable=True)

    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Conversion tracking
    is_converted = Column(Boolean, default=False)
    converted_lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    converted_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assigned_user = relationship("User", foreign_keys=[assigned_to])

    def __repr__(self):
        return f"<PreLead {self.first_name} {self.last_name}>"

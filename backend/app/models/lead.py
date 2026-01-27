from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL_SENT = "proposal_sent"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"


class LeadSource(str, enum.Enum):
    PRE_LEAD = "pre_lead"
    DIRECT = "direct"
    WEBSITE = "website"
    REFERRAL = "referral"
    SOCIAL_MEDIA = "social_media"
    COLD_CALL = "cold_call"
    WALK_IN = "walk_in"
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    ERP = "erp"
    OTHER = "other"


class LeadPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Lead(Base):
    __tablename__ = "leads"

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
    company_size = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)

    # Lead Details
    source = Column(Enum(LeadSource), default=LeadSource.DIRECT, nullable=False)
    source_details = Column(String(255), nullable=True)
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW, nullable=False)
    priority = Column(Enum(LeadPriority), default=LeadPriority.MEDIUM, nullable=False)

    # Pipeline Stage
    pipeline_stage = Column(Integer, default=1)  # 1-6 stages

    # Financial
    expected_value = Column(Numeric(15, 2), nullable=True)
    actual_value = Column(Numeric(15, 2), nullable=True)
    currency = Column(String(3), default="INR")

    # Products/Services
    product_interest = Column(String(255), nullable=True)
    requirements = Column(Text, nullable=True)

    # Timeline
    expected_close_date = Column(DateTime(timezone=True), nullable=True)
    last_contacted = Column(DateTime(timezone=True), nullable=True)
    next_follow_up = Column(DateTime(timezone=True), nullable=True)

    # Location
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    pincode = Column(String(10), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
    loss_reason = Column(Text, nullable=True)

    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    team_id = Column(Integer, nullable=True)

    # Origin tracking
    pre_lead_id = Column(Integer, ForeignKey("pre_leads.id"), nullable=True)

    # Conversion tracking
    is_converted = Column(Boolean, default=False)
    converted_customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    converted_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    pre_lead = relationship("PreLead", foreign_keys=[pre_lead_id])
    contacts = relationship("Contact", back_populates="lead", foreign_keys="Contact.lead_id")
    activities = relationship("Activity", back_populates="lead", foreign_keys="Activity.lead_id")

    def __repr__(self):
        return f"<Lead {self.first_name} {self.last_name} - {self.company_name}>"

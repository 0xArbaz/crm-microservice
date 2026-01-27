from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ContactType(str, enum.Enum):
    PRIMARY = "primary"
    BILLING = "billing"
    TECHNICAL = "technical"
    DECISION_MAKER = "decision_maker"
    INFLUENCER = "influencer"
    OTHER = "other"


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    alternate_phone = Column(String(20), nullable=True)
    whatsapp_number = Column(String(20), nullable=True)

    # Professional Information
    designation = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)

    # Contact Type
    contact_type = Column(Enum(ContactType), default=ContactType.PRIMARY)
    is_primary = Column(Boolean, default=False)

    # Preferences
    preferred_contact_method = Column(String(50), default="phone")  # phone, email, whatsapp
    best_time_to_contact = Column(String(100), nullable=True)
    do_not_contact = Column(Boolean, default=False)

    # Social
    linkedin_url = Column(String(255), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)

    # Linked Entity (Either Lead OR Customer)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="contacts", foreign_keys=[lead_id])
    customer = relationship("Customer", back_populates="contacts", foreign_keys=[customer_id])

    def __repr__(self):
        return f"<Contact {self.first_name} {self.last_name}>"

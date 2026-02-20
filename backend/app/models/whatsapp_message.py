from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class MessageDirection(str, enum.Enum):
    OUTBOUND = "outbound"
    INBOUND = "inbound"


class MessageStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class WhatsAppMessage(Base):
    """WhatsApp message log table"""
    __tablename__ = "whatsapp_messages"

    id = Column(Integer, primary_key=True, index=True)

    # Lead/Contact reference
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)
    contact_id = Column(Integer, ForeignKey("lead_contacts.id", ondelete="SET NULL"), nullable=True)

    # Phone number (recipient)
    phone_number = Column(String(30), nullable=False, index=True)
    contact_name = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)

    # Message content
    message_body = Column(Text, nullable=True)
    template_key = Column(String(100), nullable=True)

    # Direction and status
    direction = Column(SQLEnum(MessageDirection), default=MessageDirection.OUTBOUND, nullable=False)
    status = Column(SQLEnum(MessageStatus), default=MessageStatus.PENDING, nullable=False)

    # Attachments (JSON array of document links)
    file_attachment = Column(JSON, nullable=True)

    # WhatsApp API response
    external_message_id = Column(String(255), nullable=True)  # ID from WhatsApp API
    error_message = Column(Text, nullable=True)

    # Sender info
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    lead = relationship("Lead", backref="whatsapp_messages")
    sender = relationship("User", backref="whatsapp_messages_sent")

    def __repr__(self):
        return f"<WhatsAppMessage {self.id} to {self.phone_number}>"


class WhatsAppDocument(Base):
    """WhatsApp marketing documents table"""
    __tablename__ = "whatsapp_documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    folder = Column(String(255), nullable=True)
    size = Column(Integer, default=0)
    url = Column(String(500), nullable=True)

    # Metadata
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", backref="whatsapp_documents")

    def __repr__(self):
        return f"<WhatsAppDocument {self.name}>"


class WhatsAppEngagement(Base):
    """WhatsApp engagement/response tracking table"""
    __tablename__ = "whatsapp_engagements"

    id = Column(Integer, primary_key=True, index=True)

    # Phone and contact info
    phone_number = Column(String(30), nullable=False, index=True)
    contact_name = Column(String(255), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)

    # Event type (interested, not_interested, replied, etc.)
    event_type = Column(String(50), nullable=False)

    # Related message
    message_id = Column(Integer, ForeignKey("whatsapp_messages.id", ondelete="SET NULL"), nullable=True)

    # Response content
    response_body = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    lead = relationship("Lead", backref="whatsapp_engagements")
    message = relationship("WhatsAppMessage", backref="engagements")

    def __repr__(self):
        return f"<WhatsAppEngagement {self.event_type} from {self.phone_number}>"


class WhatsAppAuditLog(Base):
    """WhatsApp marketing audit trail table"""
    __tablename__ = "whatsapp_audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    # User who performed action
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Action details
    action_type = Column(String(100), nullable=False)  # e.g., "message_sent", "bulk_send", "template_used"
    comment = Column(Text, nullable=True)

    # Related entities
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    message_id = Column(Integer, ForeignKey("whatsapp_messages.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", backref="whatsapp_audit_logs")
    lead = relationship("Lead", backref="whatsapp_audit_logs")
    message = relationship("WhatsAppMessage", backref="audit_logs")

    def __repr__(self):
        return f"<WhatsAppAuditLog {self.action_type}>"

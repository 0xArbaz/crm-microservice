from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PreLeadDocument(Base):
    __tablename__ = "pre_lead_documents"

    id = Column(Integer, primary_key=True, index=True)
    pre_lead_id = Column(Integer, ForeignKey("pre_leads.id"), nullable=False, index=True)

    # File Details
    name = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=True)
    size = Column(BigInteger, nullable=True)  # File size in bytes

    # Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    pre_lead = relationship("PreLead", backref="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<PreLeadDocument {self.name}>"

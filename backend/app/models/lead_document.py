from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LeadDocument(Base):
    __tablename__ = "lead_documents"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)

    # File Details
    name = Column(String(255), nullable=False)  # Stored filename
    original_name = Column(String(255), nullable=False)  # Original filename
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(100), nullable=True)
    size = Column(Integer, nullable=True)

    # Metadata
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(Integer, nullable=True)

    # Relationship
    lead = relationship("Lead", backref="lead_documents")

    def __repr__(self):
        return f"<LeadDocument {self.original_name}>"

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LeadMemo(Base):
    __tablename__ = "lead_memos"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)

    # Memo Details
    memo_type = Column(String(50), default="general")  # general, meeting_notes, call_notes, internal, important
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    # Relationship
    lead = relationship("Lead", backref="lead_memos")

    def __repr__(self):
        return f"<LeadMemo {self.title}>"

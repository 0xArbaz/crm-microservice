from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PreLeadMemo(Base):
    __tablename__ = "pre_lead_memos"

    id = Column(Integer, primary_key=True, index=True)
    pre_lead_id = Column(Integer, ForeignKey("pre_leads.id"), nullable=False, index=True)

    # Tracking Fields - to track data for specific customers
    company_id = Column(Integer, nullable=True, index=True)
    lead_id = Column(Integer, nullable=True, index=True)

    # Memo Details
    details = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    pre_lead = relationship("PreLead", backref="memos")
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])

    def __repr__(self):
        return f"<PreLeadMemo {self.id}>"

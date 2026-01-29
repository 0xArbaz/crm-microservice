from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PreLeadStatusHistory(Base):
    __tablename__ = "pre_lead_status_history"

    id = Column(Integer, primary_key=True, index=True)
    pre_lead_id = Column(Integer, ForeignKey("pre_leads.id"), nullable=False, index=True)

    # Status Details
    status = Column(String(50), nullable=False)  # new, contacted, working, on_hold, closed_not_converted, converted
    status_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    pre_lead = relationship("PreLead", backref="status_history")
    updater = relationship("User", foreign_keys=[updated_by])

    def __repr__(self):
        return f"<PreLeadStatusHistory {self.status}>"

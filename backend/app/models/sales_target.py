from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class TargetPeriod(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class TargetType(str, enum.Enum):
    REVENUE = "revenue"
    LEAD_COUNT = "lead_count"
    CONVERSION = "conversion"
    CUSTOMER_COUNT = "customer_count"


class SalesTarget(Base):
    __tablename__ = "sales_targets"

    id = Column(Integer, primary_key=True, index=True)

    # Target Details
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    target_type = Column(Enum(TargetType), default=TargetType.REVENUE)
    period = Column(Enum(TargetPeriod), default=TargetPeriod.MONTHLY)

    # Target Values
    target_value = Column(Numeric(15, 2), nullable=False)
    achieved_value = Column(Numeric(15, 2), default=0)
    currency = Column(String(3), default="INR")

    # Period
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)

    # Assignment (can be user-specific or team-wide)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    team_id = Column(Integer, nullable=True)  # For team targets

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])

    @property
    def progress_percentage(self):
        if self.target_value and self.target_value > 0:
            return min(100, (float(self.achieved_value) / float(self.target_value)) * 100)
        return 0

    def __repr__(self):
        return f"<SalesTarget {self.name} - {self.target_value}>"

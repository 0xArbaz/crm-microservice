from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LeadQualifiedProfile(Base):
    __tablename__ = "lead_qualified_profiles"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)

    # Profile Type
    profile_type = Column(String(50), default="basic")  # basic, detailed, enterprise

    # Company Information
    company_name = Column(String(255), nullable=True)
    company_type = Column(String(100), nullable=True)
    industry_id = Column(Integer, nullable=True)
    annual_revenue = Column(String(100), nullable=True)
    employee_count = Column(String(50), nullable=True)

    # Decision Making
    decision_maker = Column(String(255), nullable=True)
    decision_process = Column(Text, nullable=True)
    budget = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)

    # Competitive Information
    competitors = Column(Text, nullable=True)
    current_solution = Column(Text, nullable=True)

    # Pain Points & Requirements
    pain_points = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)

    # Additional Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=True)
    updated_by = Column(Integer, nullable=True)

    # Relationship
    lead = relationship("Lead", backref="qualified_profiles")

    def __repr__(self):
        return f"<LeadQualifiedProfile {self.profile_type}>"

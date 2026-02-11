from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class CRIEmailTemplate(Base):
    __tablename__ = "cri_email_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    tab = Column(String(100), nullable=True)  # e.g., introduction, requirement, presentation, etc.
    email_format = Column(String(255), nullable=True)
    email_format_option_values = Column(String(255), nullable=True)
    subject = Column(String(500), nullable=True)
    email_template = Column(Text, nullable=True)  # HTML email content
    created_by = Column(Integer, nullable=True)
    company_id = Column(Integer, nullable=True)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())

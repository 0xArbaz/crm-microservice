from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Option(Base):
    """Options table - stores option categories like Lead Source, Lead Priority, etc."""
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, unique=True)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to dropdown items
    dropdowns = relationship("OptionDropdown", back_populates="option", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Option {self.title}>"


class OptionDropdown(Base):
    """Option Dropdowns table - stores the actual dropdown values for each option category"""
    __tablename__ = "options_dropdowns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    option_id = Column(Integer, ForeignKey("options.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="Active")  # Active, Inactive
    default_value = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    company_id = Column(Integer, nullable=True)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    option = relationship("Option", back_populates="dropdowns")

    def __repr__(self):
        return f"<OptionDropdown {self.name}>"

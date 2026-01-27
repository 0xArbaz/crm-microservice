from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class CustomerStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CHURNED = "churned"
    ON_HOLD = "on_hold"


class CustomerType(str, enum.Enum):
    INDIVIDUAL = "individual"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"
    GOVERNMENT = "government"


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    # Customer Code (for ERP sync)
    customer_code = Column(String(50), unique=True, index=True, nullable=True)
    erp_customer_id = Column(String(50), nullable=True)  # Reference to ERP

    # Basic Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True, index=True)
    alternate_phone = Column(String(20), nullable=True)

    # Company Information
    company_name = Column(String(255), nullable=True)
    designation = Column(String(100), nullable=True)
    company_size = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    gst_number = Column(String(20), nullable=True)
    pan_number = Column(String(20), nullable=True)

    # Customer Details
    customer_type = Column(Enum(CustomerType), default=CustomerType.BUSINESS)
    status = Column(Enum(CustomerStatus), default=CustomerStatus.ACTIVE)

    # Financial
    total_revenue = Column(Numeric(15, 2), default=0)
    credit_limit = Column(Numeric(15, 2), nullable=True)
    outstanding_amount = Column(Numeric(15, 2), default=0)
    currency = Column(String(3), default="INR")

    # Engagement
    health_score = Column(Integer, default=100)  # 0-100
    last_order_date = Column(DateTime(timezone=True), nullable=True)
    total_orders = Column(Integer, default=0)

    # Location - Billing
    billing_address = Column(Text, nullable=True)
    billing_city = Column(String(100), nullable=True)
    billing_state = Column(String(100), nullable=True)
    billing_country = Column(String(100), default="India")
    billing_pincode = Column(String(10), nullable=True)

    # Location - Shipping
    shipping_address = Column(Text, nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(100), nullable=True)
    shipping_country = Column(String(100), default="India")
    shipping_pincode = Column(String(10), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)

    # Assignment
    account_manager = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Origin tracking
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    manager = relationship("User", foreign_keys=[account_manager])
    lead = relationship("Lead", foreign_keys=[lead_id])
    contacts = relationship("Contact", back_populates="customer", foreign_keys="Contact.customer_id")
    activities = relationship("Activity", back_populates="customer", foreign_keys="Activity.customer_id")

    def __repr__(self):
        return f"<Customer {self.first_name} {self.last_name} - {self.company_name}>"

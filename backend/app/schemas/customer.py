from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.customer import CustomerStatus, CustomerType


class CustomerBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    customer_type: CustomerType = CustomerType.BUSINESS
    credit_limit: Optional[Decimal] = None
    currency: str = "INR"
    billing_address: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_country: str = "India"
    billing_pincode: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_country: str = "India"
    shipping_pincode: Optional[str] = None
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    customer_code: Optional[str] = None
    erp_customer_id: Optional[str] = None
    account_manager: Optional[int] = None
    lead_id: Optional[int] = None


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    customer_type: Optional[CustomerType] = None
    status: Optional[CustomerStatus] = None
    credit_limit: Optional[Decimal] = None
    currency: Optional[str] = None
    billing_address: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_country: Optional[str] = None
    billing_pincode: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_country: Optional[str] = None
    shipping_pincode: Optional[str] = None
    notes: Optional[str] = None
    account_manager: Optional[int] = None
    erp_customer_id: Optional[str] = None


class CustomerResponse(CustomerBase):
    id: int
    customer_code: Optional[str] = None
    erp_customer_id: Optional[str] = None
    status: CustomerStatus
    total_revenue: Decimal
    outstanding_amount: Decimal
    health_score: int
    last_order_date: Optional[datetime] = None
    total_orders: int
    lead_id: Optional[int] = None
    account_manager: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

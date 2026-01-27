from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.contact import ContactType


class ContactBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    contact_type: ContactType = ContactType.PRIMARY
    is_primary: bool = False
    preferred_contact_method: str = "phone"
    best_time_to_contact: Optional[str] = None
    do_not_contact: bool = False
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    lead_id: Optional[int] = None
    customer_id: Optional[int] = None


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    contact_type: Optional[ContactType] = None
    is_primary: Optional[bool] = None
    preferred_contact_method: Optional[str] = None
    best_time_to_contact: Optional[str] = None
    do_not_contact: Optional[bool] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    id: int
    lead_id: Optional[int] = None
    customer_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactListResponse(BaseModel):
    items: list[ContactResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CRIEmailTemplateBase(BaseModel):
    title: str
    tab: Optional[str] = None
    email_format: Optional[str] = None
    email_format_option_values: Optional[str] = None
    subject: Optional[str] = None
    email_template: Optional[str] = None
    created_by: Optional[int] = None
    company_id: Optional[int] = None


class CRIEmailTemplateCreate(CRIEmailTemplateBase):
    pass


class CRIEmailTemplateUpdate(BaseModel):
    title: Optional[str] = None
    tab: Optional[str] = None
    email_format: Optional[str] = None
    email_format_option_values: Optional[str] = None
    subject: Optional[str] = None
    email_template: Optional[str] = None
    created_by: Optional[int] = None
    company_id: Optional[int] = None


class CRIEmailTemplateResponse(CRIEmailTemplateBase):
    id: int
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        from_attributes = True

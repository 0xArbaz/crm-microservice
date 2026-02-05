from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.sales_target import TargetPeriod, TargetType


class SalesTargetBase(BaseModel):
    name: str
    designation: Optional[str] = None
    reporting_to: Optional[str] = None
    region: Optional[str] = None
    frequency: str = "monthly"  # daily, weekly, monthly, quarterly, yearly
    stage: Optional[str] = None
    sales_type: Optional[str] = None  # lead_generated, email, linkedin, whatsapp, call, meeting
    target_value: Decimal
    start_date: datetime
    end_date: datetime
    remarks: Optional[str] = None
    # Legacy fields
    description: Optional[str] = None
    target_type: TargetType = TargetType.REVENUE
    period: TargetPeriod = TargetPeriod.MONTHLY
    currency: str = "INR"


class SalesTargetCreate(SalesTargetBase):
    user_id: Optional[int] = None
    team_id: Optional[int] = None


class SalesTargetUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    reporting_to: Optional[str] = None
    region: Optional[str] = None
    frequency: Optional[str] = None
    stage: Optional[str] = None
    sales_type: Optional[str] = None
    target_value: Optional[Decimal] = None
    achieved_value: Optional[Decimal] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    remarks: Optional[str] = None
    # Legacy fields
    description: Optional[str] = None
    target_type: Optional[TargetType] = None
    period: Optional[TargetPeriod] = None
    currency: Optional[str] = None
    user_id: Optional[int] = None
    team_id: Optional[int] = None


class SalesTargetResponse(SalesTargetBase):
    id: int
    achieved_value: Decimal
    progress_percentage: float
    user_id: Optional[int] = None
    team_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SalesTargetListResponse(BaseModel):
    items: list[SalesTargetResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.sales_target import TargetPeriod, TargetType


class SalesTargetBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_type: TargetType = TargetType.REVENUE
    period: TargetPeriod = TargetPeriod.MONTHLY
    target_value: Decimal
    currency: str = "INR"
    start_date: datetime
    end_date: datetime


class SalesTargetCreate(SalesTargetBase):
    user_id: Optional[int] = None
    team_id: Optional[int] = None


class SalesTargetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_type: Optional[TargetType] = None
    period: Optional[TargetPeriod] = None
    target_value: Optional[Decimal] = None
    achieved_value: Optional[Decimal] = None
    currency: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
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

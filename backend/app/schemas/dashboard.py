from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class CountStats(BaseModel):
    total: int
    today: int
    this_week: int
    this_month: int
    change_percentage: float  # vs last period


class ConversionStats(BaseModel):
    pre_lead_to_lead: float
    lead_to_customer: float
    overall: float


class FunnelStage(BaseModel):
    stage: str
    count: int
    value: Decimal


class FunnelData(BaseModel):
    pre_leads: int
    leads: int
    customers: int
    stages: List[FunnelStage]


class RecentActivity(BaseModel):
    id: int
    activity_type: str
    subject: str
    description: Optional[str] = None
    entity_type: str  # pre_lead, lead, customer
    entity_id: int
    entity_name: str
    performed_by_name: Optional[str] = None
    created_at: datetime


class LeadsBySource(BaseModel):
    source: str
    count: int
    percentage: float


class LeadsByStatus(BaseModel):
    status: str
    count: int


class SalesTargetProgress(BaseModel):
    target_name: str
    target_value: Decimal
    achieved_value: Decimal
    progress_percentage: float
    currency: str


class TopPerformer(BaseModel):
    user_id: int
    user_name: str
    leads_converted: int
    revenue_generated: Decimal


class DashboardStats(BaseModel):
    # Counts
    pre_leads: CountStats
    leads: CountStats
    customers: CountStats

    # Conversions
    conversions: ConversionStats

    # Funnel
    funnel: FunnelData

    # Recent activities
    recent_activities: List[RecentActivity]

    # Distribution
    leads_by_source: List[LeadsBySource]
    leads_by_status: List[LeadsByStatus]

    # Sales targets
    sales_targets: List[SalesTargetProgress]

    # Top performers
    top_performers: List[TopPerformer]


class QuickStats(BaseModel):
    """Lightweight stats for quick dashboard refresh"""
    total_pre_leads: int
    total_leads: int
    total_customers: int
    pending_follow_ups: int
    overdue_tasks: int

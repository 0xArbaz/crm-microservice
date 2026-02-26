from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.pre_lead import PreLead
from app.models.lead import Lead, LeadSource
from app.models.customer import Customer, CustomerStatus
from app.models.activity import Activity
from app.models.sales_target import SalesTarget
from app.schemas.dashboard import (
    DashboardStats, QuickStats, CountStats, ConversionStats,
    FunnelData, FunnelStage, RecentActivity, LeadsBySource,
    LeadsByStatus, SalesTargetProgress, TopPerformer
)

router = APIRouter()


def get_count_stats(db: Session, model, date_field="created_at", active_status=None) -> CountStats:
    """Get count statistics for a model (only active records)"""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    # Base filter for active records
    base_filter = []
    if active_status is not None:
        base_filter.append(active_status)

    total = db.query(func.count(model.id)).filter(*base_filter).scalar() or 0
    today = db.query(func.count(model.id)).filter(
        *base_filter,
        getattr(model, date_field) >= today_start
    ).scalar() or 0
    this_week = db.query(func.count(model.id)).filter(
        *base_filter,
        getattr(model, date_field) >= week_start
    ).scalar() or 0
    this_month = db.query(func.count(model.id)).filter(
        *base_filter,
        getattr(model, date_field) >= month_start
    ).scalar() or 0
    last_month = db.query(func.count(model.id)).filter(
        *base_filter,
        getattr(model, date_field) >= last_month_start,
        getattr(model, date_field) < month_start
    ).scalar() or 0

    change_percentage = 0.0
    if last_month > 0:
        change_percentage = ((this_month - last_month) / last_month) * 100

    return CountStats(
        total=total,
        today=today,
        this_week=this_week,
        this_month=this_month,
        change_percentage=round(change_percentage, 2)
    )


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive dashboard statistics"""

    # Count stats (filter by active status)
    pre_lead_stats = get_count_stats(db, PreLead, active_status=(PreLead.status == 0))
    lead_stats = get_count_stats(db, Lead, active_status=(Lead.status == 0))
    customer_stats = get_count_stats(db, Customer, active_status=(Customer.status == CustomerStatus.ACTIVE))

    # Conversion stats (only active records with status=0)
    total_pre_leads = db.query(func.count(PreLead.id)).filter(PreLead.status == 0).scalar() or 1
    total_leads = db.query(func.count(Lead.id)).filter(Lead.status == 0).scalar() or 1
    converted_pre_leads = db.query(func.count(PreLead.id)).filter(
        PreLead.status == 0,
        PreLead.is_converted == True
    ).scalar() or 0
    converted_leads = db.query(func.count(Lead.id)).filter(
        Lead.status == 0,
        Lead.is_converted == True
    ).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).filter(
        Customer.status == CustomerStatus.ACTIVE
    ).scalar() or 0

    conversions = ConversionStats(
        pre_lead_to_lead=round((converted_pre_leads / total_pre_leads) * 100, 2) if total_pre_leads else 0,
        lead_to_customer=round((converted_leads / total_leads) * 100, 2) if total_leads else 0,
        overall=round((total_customers / total_pre_leads) * 100, 2) if total_pre_leads else 0
    )

    # Funnel data - using lead_status workflow field (only active leads with status=0)
    lead_status_values = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "won", "lost"]
    funnel_stages = []
    for status_val in lead_status_values:
        count = db.query(func.count(Lead.id)).filter(
            Lead.status == 0,
            Lead.lead_status == status_val
        ).scalar() or 0
        value = db.query(func.sum(Lead.expected_value)).filter(
            Lead.status == 0,
            Lead.lead_status == status_val
        ).scalar() or Decimal(0)
        funnel_stages.append(FunnelStage(stage=status_val, count=count, value=value))

    funnel = FunnelData(
        pre_leads=pre_lead_stats.total,
        leads=lead_stats.total,
        customers=customer_stats.total,
        stages=funnel_stages
    )

    # Recent activities
    recent_activities_raw = db.query(Activity).order_by(
        Activity.created_at.desc()
    ).limit(10).all()

    recent_activities = []
    for activity in recent_activities_raw:
        entity_type = "lead" if activity.lead_id else "customer"
        entity_id = activity.lead_id or activity.customer_id
        entity_name = "Unknown"

        if activity.lead_id:
            lead = db.query(Lead).filter(Lead.id == activity.lead_id).first()
            if lead:
                entity_name = f"{lead.first_name} {lead.last_name or ''}".strip()
        elif activity.customer_id:
            customer = db.query(Customer).filter(Customer.id == activity.customer_id).first()
            if customer:
                entity_name = f"{customer.first_name} {customer.last_name or ''}".strip()

        performer_name = None
        if activity.performed_by:
            performer = db.query(User).filter(User.id == activity.performed_by).first()
            if performer:
                performer_name = performer.full_name

        recent_activities.append(RecentActivity(
            id=activity.id,
            activity_type=activity.activity_type.value,
            subject=activity.subject,
            description=activity.description,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            performed_by_name=performer_name,
            created_at=activity.created_at
        ))

    # Leads by source (only active leads with status=0)
    leads_by_source_raw = db.query(
        Lead.source,
        func.count(Lead.id).label('count')
    ).filter(Lead.status == 0).group_by(Lead.source).all()

    total_leads_count = sum(item.count for item in leads_by_source_raw) or 1
    leads_by_source = [
        LeadsBySource(
            source=item.source.value if item.source else "unknown",
            count=item.count,
            percentage=round((item.count / total_leads_count) * 100, 2)
        )
        for item in leads_by_source_raw
        if item.source is not None
    ]

    # Leads by status - using lead_status workflow field (only active leads with status=0)
    leads_by_status = [
        LeadsByStatus(
            status=status_val,
            count=db.query(func.count(Lead.id)).filter(
                Lead.status == 0,
                Lead.lead_status == status_val
            ).scalar() or 0
        )
        for status_val in lead_status_values
    ]

    # Sales targets
    now = datetime.utcnow()
    active_targets = db.query(SalesTarget).filter(
        and_(
            SalesTarget.start_date <= now,
            SalesTarget.end_date >= now
        )
    ).all()

    sales_targets = [
        SalesTargetProgress(
            target_name=target.name,
            target_value=target.target_value,
            achieved_value=target.achieved_value,
            progress_percentage=round(
                (float(target.achieved_value) / float(target.target_value)) * 100, 2
            ) if target.target_value else 0,
            currency=target.currency
        )
        for target in active_targets
    ]

    # Top performers (simplified)
    top_performers = []

    return DashboardStats(
        pre_leads=pre_lead_stats,
        leads=lead_stats,
        customers=customer_stats,
        conversions=conversions,
        funnel=funnel,
        recent_activities=recent_activities,
        leads_by_source=leads_by_source,
        leads_by_status=leads_by_status,
        sales_targets=sales_targets,
        top_performers=top_performers
    )


@router.get("/quick-stats", response_model=QuickStats)
def get_quick_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quick dashboard statistics (only active records with status=0)"""
    now = datetime.utcnow()

    return QuickStats(
        total_pre_leads=db.query(func.count(PreLead.id)).filter(PreLead.status == 0).scalar() or 0,
        total_leads=db.query(func.count(Lead.id)).filter(Lead.status == 0).scalar() or 0,
        total_customers=db.query(func.count(Customer.id)).filter(
            Customer.status == CustomerStatus.ACTIVE
        ).scalar() or 0,
        pending_follow_ups=db.query(func.count(Lead.id)).filter(
            Lead.status == 0,
            Lead.next_follow_up.isnot(None),
            Lead.next_follow_up <= now + timedelta(days=1)
        ).scalar() or 0,
        overdue_tasks=db.query(func.count(Activity.id)).filter(
            Activity.is_completed == False,
            Activity.scheduled_date < now
        ).scalar() or 0
    )

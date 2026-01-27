from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.activity import Activity, ActivityType, ActivityOutcome
from app.models.lead import Lead
from app.schemas.activity import (
    ActivityCreate, ActivityUpdate, ActivityResponse, ActivityListResponse
)
from app.core.permissions import check_permission

router = APIRouter()


@router.post("/", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity"""
    if not check_permission(current_user.role, "activities", "create"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Validate that either lead_id or customer_id is provided
    if not activity_data.lead_id and not activity_data.customer_id:
        raise HTTPException(
            status_code=400,
            detail="Activity must be linked to a lead or customer"
        )

    activity = Activity(**activity_data.model_dump())
    activity.performed_by = current_user.id

    db.add(activity)

    # Update lead's last_contacted if this is a contact activity
    if activity_data.lead_id and activity_data.activity_type in [
        ActivityType.CALL, ActivityType.EMAIL, ActivityType.MEETING, ActivityType.WHATSAPP
    ]:
        lead = db.query(Lead).filter(Lead.id == activity_data.lead_id).first()
        if lead:
            lead.last_contacted = datetime.utcnow()

    db.commit()
    db.refresh(activity)

    return activity


@router.get("/", response_model=ActivityListResponse)
def list_activities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    lead_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    activity_type: Optional[ActivityType] = None,
    is_completed: Optional[bool] = None,
    performed_by: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List activities with filtering and pagination"""
    if not check_permission(current_user.role, "activities", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(Activity)

    # Apply filters
    if lead_id:
        query = query.filter(Activity.lead_id == lead_id)

    if customer_id:
        query = query.filter(Activity.customer_id == customer_id)

    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)

    if is_completed is not None:
        query = query.filter(Activity.is_completed == is_completed)

    if performed_by:
        query = query.filter(Activity.performed_by == performed_by)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    activities = query.order_by(Activity.created_at.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return ActivityListResponse(
        items=activities,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/lead/{lead_id}", response_model=list[ActivityResponse])
def get_lead_activities(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all activities for a lead"""
    if not check_permission(current_user.role, "activities", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activities = db.query(Activity).filter(
        Activity.lead_id == lead_id
    ).order_by(Activity.created_at.desc()).all()
    return activities


@router.get("/customer/{customer_id}", response_model=list[ActivityResponse])
def get_customer_activities(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all activities for a customer"""
    if not check_permission(current_user.role, "activities", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activities = db.query(Activity).filter(
        Activity.customer_id == customer_id
    ).order_by(Activity.created_at.desc()).all()
    return activities


@router.get("/pending", response_model=list[ActivityResponse])
def get_pending_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pending/scheduled activities for current user"""
    if not check_permission(current_user.role, "activities", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activities = db.query(Activity).filter(
        and_(
            Activity.performed_by == current_user.id,
            Activity.is_completed == False,
            Activity.scheduled_date.isnot(None)
        )
    ).order_by(Activity.scheduled_date.asc()).all()
    return activities


@router.get("/overdue", response_model=list[ActivityResponse])
def get_overdue_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overdue activities for current user"""
    if not check_permission(current_user.role, "activities", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    now = datetime.utcnow()
    activities = db.query(Activity).filter(
        and_(
            Activity.performed_by == current_user.id,
            Activity.is_completed == False,
            Activity.scheduled_date < now
        )
    ).order_by(Activity.scheduled_date.asc()).all()
    return activities


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific activity"""
    if not check_permission(current_user.role, "activities", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: int,
    activity_data: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an activity"""
    if not check_permission(current_user.role, "activities", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    for field, value in activity_data.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)

    # Set completed_at if marking as completed
    if activity_data.is_completed and not activity.completed_at:
        activity.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(activity)

    return activity


@router.post("/{activity_id}/complete", response_model=ActivityResponse)
def complete_activity(
    activity_id: int,
    outcome: Optional[ActivityOutcome] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark activity as completed"""
    if not check_permission(current_user.role, "activities", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity.is_completed = True
    activity.completed_at = datetime.utcnow()
    if outcome:
        activity.outcome = outcome

    db.commit()
    db.refresh(activity)

    return activity


@router.delete("/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an activity"""
    if not check_permission(current_user.role, "activities", "delete"):
        raise HTTPException(status_code=403, detail="Permission denied")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}

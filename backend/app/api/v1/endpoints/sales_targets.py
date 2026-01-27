from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.sales_target import SalesTarget, TargetPeriod, TargetType
from app.schemas.sales_target import (
    SalesTargetCreate, SalesTargetUpdate, SalesTargetResponse, SalesTargetListResponse
)
from app.core.permissions import check_permission

router = APIRouter()


@router.post("/", response_model=SalesTargetResponse, status_code=status.HTTP_201_CREATED)
def create_sales_target(
    target_data: SalesTargetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new sales target"""
    if not check_permission(current_user.role, "sales_targets", "create"):
        raise HTTPException(status_code=403, detail="Permission denied")

    target = SalesTarget(**target_data.model_dump())
    db.add(target)
    db.commit()
    db.refresh(target)

    return target


@router.get("/", response_model=SalesTargetListResponse)
def list_sales_targets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = None,
    team_id: Optional[int] = None,
    period: Optional[TargetPeriod] = None,
    target_type: Optional[TargetType] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List sales targets with filtering and pagination"""
    if not check_permission(current_user.role, "sales_targets", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(SalesTarget)
    now = datetime.utcnow()

    # Apply filters
    if user_id:
        query = query.filter(SalesTarget.user_id == user_id)

    if team_id:
        query = query.filter(SalesTarget.team_id == team_id)

    if period:
        query = query.filter(SalesTarget.period == period)

    if target_type:
        query = query.filter(SalesTarget.target_type == target_type)

    if active_only:
        query = query.filter(
            and_(
                SalesTarget.start_date <= now,
                SalesTarget.end_date >= now
            )
        )

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    targets = query.order_by(SalesTarget.start_date.desc()).offset(offset).limit(page_size).all()

    # Calculate progress percentage for each target
    targets_with_progress = []
    for target in targets:
        target_dict = {
            "id": target.id,
            "name": target.name,
            "description": target.description,
            "target_type": target.target_type,
            "period": target.period,
            "target_value": target.target_value,
            "achieved_value": target.achieved_value,
            "currency": target.currency,
            "start_date": target.start_date,
            "end_date": target.end_date,
            "user_id": target.user_id,
            "team_id": target.team_id,
            "created_at": target.created_at,
            "updated_at": target.updated_at,
            "progress_percentage": target.progress_percentage
        }
        targets_with_progress.append(SalesTargetResponse(**target_dict))

    total_pages = (total + page_size - 1) // page_size

    return SalesTargetListResponse(
        items=targets_with_progress,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/my-targets", response_model=list[SalesTargetResponse])
def get_my_targets(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's sales targets"""
    if not check_permission(current_user.role, "sales_targets", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(SalesTarget).filter(SalesTarget.user_id == current_user.id)

    if active_only:
        now = datetime.utcnow()
        query = query.filter(
            and_(
                SalesTarget.start_date <= now,
                SalesTarget.end_date >= now
            )
        )

    targets = query.order_by(SalesTarget.start_date.desc()).all()

    return [
        SalesTargetResponse(
            id=t.id,
            name=t.name,
            description=t.description,
            target_type=t.target_type,
            period=t.period,
            target_value=t.target_value,
            achieved_value=t.achieved_value,
            currency=t.currency,
            start_date=t.start_date,
            end_date=t.end_date,
            user_id=t.user_id,
            team_id=t.team_id,
            created_at=t.created_at,
            updated_at=t.updated_at,
            progress_percentage=t.progress_percentage
        )
        for t in targets
    ]


@router.get("/{target_id}", response_model=SalesTargetResponse)
def get_sales_target(
    target_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific sales target"""
    if not check_permission(current_user.role, "sales_targets", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    target = db.query(SalesTarget).filter(SalesTarget.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Sales target not found")

    return SalesTargetResponse(
        id=target.id,
        name=target.name,
        description=target.description,
        target_type=target.target_type,
        period=target.period,
        target_value=target.target_value,
        achieved_value=target.achieved_value,
        currency=target.currency,
        start_date=target.start_date,
        end_date=target.end_date,
        user_id=target.user_id,
        team_id=target.team_id,
        created_at=target.created_at,
        updated_at=target.updated_at,
        progress_percentage=target.progress_percentage
    )


@router.put("/{target_id}", response_model=SalesTargetResponse)
def update_sales_target(
    target_id: int,
    target_data: SalesTargetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a sales target"""
    if not check_permission(current_user.role, "sales_targets", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    target = db.query(SalesTarget).filter(SalesTarget.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Sales target not found")

    for field, value in target_data.model_dump(exclude_unset=True).items():
        setattr(target, field, value)

    db.commit()
    db.refresh(target)

    return SalesTargetResponse(
        id=target.id,
        name=target.name,
        description=target.description,
        target_type=target.target_type,
        period=target.period,
        target_value=target.target_value,
        achieved_value=target.achieved_value,
        currency=target.currency,
        start_date=target.start_date,
        end_date=target.end_date,
        user_id=target.user_id,
        team_id=target.team_id,
        created_at=target.created_at,
        updated_at=target.updated_at,
        progress_percentage=target.progress_percentage
    )


@router.put("/{target_id}/progress")
def update_target_progress(
    target_id: int,
    achieved_value: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update sales target progress"""
    if not check_permission(current_user.role, "sales_targets", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    target = db.query(SalesTarget).filter(SalesTarget.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Sales target not found")

    target.achieved_value = achieved_value
    db.commit()

    return {
        "message": "Target progress updated",
        "achieved_value": float(target.achieved_value),
        "target_value": float(target.target_value),
        "progress_percentage": target.progress_percentage
    }


@router.delete("/{target_id}")
def delete_sales_target(
    target_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a sales target"""
    if not check_permission(current_user.role, "sales_targets", "delete"):
        raise HTTPException(status_code=403, detail="Permission denied")

    target = db.query(SalesTarget).filter(SalesTarget.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Sales target not found")

    db.delete(target)
    db.commit()

    return {"message": "Sales target deleted successfully"}

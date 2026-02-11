from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.option_master import Option, OptionDropdown
from app.schemas.option_master import (
    OptionCreate, OptionUpdate, OptionResponse, OptionWithDropdownsResponse,
    OptionDropdownCreate, OptionDropdownUpdate, OptionDropdownResponse
)

router = APIRouter()


# ============ Options Endpoints ============

@router.get("/", response_model=List[OptionResponse])
def get_options(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all option categories"""
    options = db.query(Option).offset(skip).limit(limit).all()
    return options


@router.get("/with-dropdowns", response_model=List[OptionWithDropdownsResponse])
def get_options_with_dropdowns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all option categories with their dropdown items"""
    options = db.query(Option).all()
    return options


@router.get("/by-title/{title}", response_model=OptionWithDropdownsResponse)
def get_option_by_title(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get an option category by title with its dropdown items"""
    option = db.query(Option).filter(Option.title == title).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")
    return option


@router.get("/dropdown-values/{option_title}", response_model=List[OptionDropdownResponse])
def get_dropdown_values_by_option_title(
    option_title: str,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dropdown values for an option by its title (useful for populating form dropdowns)"""
    option = db.query(Option).filter(Option.title == option_title).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    query = db.query(OptionDropdown).filter(OptionDropdown.option_id == option.id)

    if active_only:
        query = query.filter(OptionDropdown.status == "Active")

    return query.all()


@router.post("/", response_model=OptionResponse)
def create_option(
    option_data: OptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new option category"""
    # Check if option with same title exists
    existing = db.query(Option).filter(Option.title == option_data.title).first()
    if existing:
        raise HTTPException(status_code=400, detail="Option with this title already exists")

    option = Option(**option_data.model_dump())
    db.add(option)
    db.commit()
    db.refresh(option)
    return option


@router.get("/{option_id}", response_model=OptionWithDropdownsResponse)
def get_option(
    option_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single option category with its dropdown items"""
    option = db.query(Option).filter(Option.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")
    return option


@router.put("/{option_id}", response_model=OptionResponse)
def update_option(
    option_id: int,
    option_data: OptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an option category"""
    option = db.query(Option).filter(Option.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    update_data = option_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(option, field, value)

    db.commit()
    db.refresh(option)
    return option


@router.delete("/{option_id}")
def delete_option(
    option_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an option category and all its dropdown items"""
    option = db.query(Option).filter(Option.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    db.delete(option)
    db.commit()
    return {"message": "Option deleted successfully"}


# ============ Option Dropdowns Endpoints ============

@router.get("/{option_id}/dropdowns", response_model=List[OptionDropdownResponse])
def get_option_dropdowns(
    option_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all dropdown items for an option category"""
    query = db.query(OptionDropdown).filter(OptionDropdown.option_id == option_id)

    if status:
        query = query.filter(OptionDropdown.status == status)

    dropdowns = query.all()
    return dropdowns


@router.post("/{option_id}/dropdowns", response_model=OptionDropdownResponse)
def create_option_dropdown(
    option_id: int,
    dropdown_data: OptionDropdownCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new dropdown item for an option category"""
    # Verify option exists
    option = db.query(Option).filter(Option.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    # If this is set as default, remove default from other items
    if dropdown_data.default_value:
        db.query(OptionDropdown).filter(
            OptionDropdown.option_id == option_id
        ).update({"default_value": False})

    dropdown = OptionDropdown(
        name=dropdown_data.name,
        option_id=option_id,
        status=dropdown_data.status,
        default_value=dropdown_data.default_value,
        company_id=dropdown_data.company_id,
        created_by=current_user.id
    )
    db.add(dropdown)
    db.commit()
    db.refresh(dropdown)
    return dropdown


@router.put("/{option_id}/dropdowns/{dropdown_id}", response_model=OptionDropdownResponse)
def update_option_dropdown(
    option_id: int,
    dropdown_id: int,
    dropdown_data: OptionDropdownUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a dropdown item"""
    dropdown = db.query(OptionDropdown).filter(
        and_(
            OptionDropdown.id == dropdown_id,
            OptionDropdown.option_id == option_id
        )
    ).first()

    if not dropdown:
        raise HTTPException(status_code=404, detail="Dropdown not found")

    update_data = dropdown_data.model_dump(exclude_unset=True)

    # If setting as default, remove default from other items
    if update_data.get("default_value") == True:
        db.query(OptionDropdown).filter(
            and_(
                OptionDropdown.option_id == option_id,
                OptionDropdown.id != dropdown_id
            )
        ).update({"default_value": False})

    for field, value in update_data.items():
        setattr(dropdown, field, value)

    db.commit()
    db.refresh(dropdown)
    return dropdown


@router.delete("/{option_id}/dropdowns/{dropdown_id}")
def delete_option_dropdown(
    option_id: int,
    dropdown_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a dropdown item"""
    dropdown = db.query(OptionDropdown).filter(
        and_(
            OptionDropdown.id == dropdown_id,
            OptionDropdown.option_id == option_id
        )
    ).first()

    if not dropdown:
        raise HTTPException(status_code=404, detail="Dropdown not found")

    db.delete(dropdown)
    db.commit()
    return {"message": "Dropdown deleted successfully"}

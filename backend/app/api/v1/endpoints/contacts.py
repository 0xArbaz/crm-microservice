from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.contact import Contact, ContactType
from app.schemas.contact import (
    ContactCreate, ContactUpdate, ContactResponse, ContactListResponse
)
from app.core.permissions import check_permission

router = APIRouter()


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contact"""
    if not check_permission(current_user.role, "contacts", "create"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Validate that either lead_id or customer_id is provided
    if not contact_data.lead_id and not contact_data.customer_id:
        raise HTTPException(
            status_code=400,
            detail="Contact must be linked to a lead or customer"
        )

    contact = Contact(**contact_data.model_dump())

    # If this is set as primary, unset other primary contacts for the same entity
    if contact.is_primary:
        if contact.lead_id:
            db.query(Contact).filter(
                Contact.lead_id == contact.lead_id,
                Contact.is_primary == True
            ).update({"is_primary": False})
        elif contact.customer_id:
            db.query(Contact).filter(
                Contact.customer_id == contact.customer_id,
                Contact.is_primary == True
            ).update({"is_primary": False})

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


@router.get("/", response_model=ContactListResponse)
def list_contacts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    lead_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    contact_type: Optional[ContactType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List contacts with filtering and pagination"""
    if not check_permission(current_user.role, "contacts", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(Contact)

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Contact.first_name.ilike(search_term),
                Contact.last_name.ilike(search_term),
                Contact.email.ilike(search_term),
                Contact.phone.ilike(search_term)
            )
        )

    if lead_id:
        query = query.filter(Contact.lead_id == lead_id)

    if customer_id:
        query = query.filter(Contact.customer_id == customer_id)

    if contact_type:
        query = query.filter(Contact.contact_type == contact_type)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    contacts = query.order_by(Contact.created_at.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return ContactListResponse(
        items=contacts,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/lead/{lead_id}", response_model=list[ContactResponse])
def get_lead_contacts(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all contacts for a lead"""
    if not check_permission(current_user.role, "contacts", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contacts = db.query(Contact).filter(Contact.lead_id == lead_id).all()
    return contacts


@router.get("/customer/{customer_id}", response_model=list[ContactResponse])
def get_customer_contacts(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all contacts for a customer"""
    if not check_permission(current_user.role, "contacts", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contacts = db.query(Contact).filter(Contact.customer_id == customer_id).all()
    return contacts


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific contact"""
    if not check_permission(current_user.role, "contacts", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact_data: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a contact"""
    if not check_permission(current_user.role, "contacts", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Handle primary contact update
    if contact_data.is_primary and contact_data.is_primary != contact.is_primary:
        if contact.lead_id:
            db.query(Contact).filter(
                Contact.lead_id == contact.lead_id,
                Contact.is_primary == True
            ).update({"is_primary": False})
        elif contact.customer_id:
            db.query(Contact).filter(
                Contact.customer_id == contact.customer_id,
                Contact.is_primary == True
            ).update({"is_primary": False})

    for field, value in contact_data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)

    return contact


@router.delete("/{contact_id}")
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a contact"""
    if not check_permission(current_user.role, "contacts", "delete"):
        raise HTTPException(status_code=403, detail="Permission denied")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()

    return {"message": "Contact deleted successfully"}

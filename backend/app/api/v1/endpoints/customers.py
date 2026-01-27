from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.customer import Customer, CustomerStatus, CustomerType
from app.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
)
from app.core.permissions import check_permission

router = APIRouter()


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new customer"""
    if not check_permission(current_user.role, "customers", "create"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Generate customer code if not provided
    if not customer_data.customer_code:
        from datetime import datetime
        count = db.query(Customer).count() + 1
        customer_data_dict = customer_data.model_dump()
        customer_data_dict['customer_code'] = f"CUS-{datetime.utcnow().strftime('%Y%m')}-{count:04d}"
    else:
        customer_data_dict = customer_data.model_dump()

    customer = Customer(**customer_data_dict)
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


@router.get("/", response_model=CustomerListResponse)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[CustomerStatus] = None,
    customer_type: Optional[CustomerType] = None,
    account_manager: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List customers with filtering and pagination"""
    if not check_permission(current_user.role, "customers", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    query = db.query(Customer)

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Customer.first_name.ilike(search_term),
                Customer.last_name.ilike(search_term),
                Customer.email.ilike(search_term),
                Customer.phone.ilike(search_term),
                Customer.company_name.ilike(search_term),
                Customer.customer_code.ilike(search_term)
            )
        )

    if status:
        query = query.filter(Customer.status == status)

    if customer_type:
        query = query.filter(Customer.customer_type == customer_type)

    if account_manager:
        query = query.filter(Customer.account_manager == account_manager)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    customers = query.order_by(Customer.created_at.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size

    return CustomerListResponse(
        items=customers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific customer"""
    if not check_permission(current_user.role, "customers", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer


@router.get("/code/{customer_code}", response_model=CustomerResponse)
def get_customer_by_code(
    customer_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer by customer code"""
    if not check_permission(current_user.role, "customers", "read"):
        raise HTTPException(status_code=403, detail="Permission denied")

    customer = db.query(Customer).filter(Customer.customer_code == customer_code).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a customer"""
    if not check_permission(current_user.role, "customers", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, value in customer_data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    # TODO: Sync updated customer to ERP

    return customer


@router.put("/{customer_id}/health-score", response_model=CustomerResponse)
def update_customer_health_score(
    customer_id: int,
    health_score: int = Query(..., ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update customer health score"""
    if not check_permission(current_user.role, "customers", "update"):
        raise HTTPException(status_code=403, detail="Permission denied")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.health_score = health_score
    db.commit()
    db.refresh(customer)

    return customer


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a customer (Admin only)"""
    if not check_permission(current_user.role, "customers", "delete"):
        raise HTTPException(status_code=403, detail="Permission denied")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()

    return {"message": "Customer deleted successfully"}

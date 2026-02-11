from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.location import Country, State, City
from app.schemas.location import (
    CountryCreate, CountryUpdate, CountryResponse, CountryWithStatesResponse,
    StateCreate, StateUpdate, StateResponse, StateWithCitiesResponse,
    CityCreate, CityUpdate, CityResponse
)

router = APIRouter()


# ============ Country Endpoints ============

@router.get("/countries", response_model=List[CountryResponse])
def get_countries(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all countries (public endpoint)"""
    query = db.query(Country)
    if status:
        query = query.filter(Country.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/countries/{country_id}", response_model=CountryWithStatesResponse)
def get_country(
    country_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a country with its states"""
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return country


@router.post("/countries", response_model=CountryResponse)
def create_country(
    data: CountryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new country"""
    country = Country(**data.model_dump())
    db.add(country)
    db.commit()
    db.refresh(country)
    return country


@router.put("/countries/{country_id}", response_model=CountryResponse)
def update_country(
    country_id: int,
    data: CountryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a country"""
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(country, field, value)

    db.commit()
    db.refresh(country)
    return country


@router.delete("/countries/{country_id}")
def delete_country(
    country_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a country"""
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")

    db.delete(country)
    db.commit()
    return {"message": "Country deleted successfully"}


# ============ State Endpoints ============

@router.get("/states", response_model=List[StateResponse])
def get_states(
    country_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all states, optionally filtered by country (public endpoint)"""
    query = db.query(State)
    if country_id:
        query = query.filter(State.country_id == country_id)
    if status:
        query = query.filter(State.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/states/{state_id}", response_model=StateWithCitiesResponse)
def get_state(
    state_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a state with its cities"""
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found")
    return state


@router.post("/states", response_model=StateResponse)
def create_state(
    data: StateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new state"""
    # Verify country exists
    country = db.query(Country).filter(Country.id == data.country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")

    state = State(**data.model_dump())
    db.add(state)
    db.commit()
    db.refresh(state)
    return state


@router.put("/states/{state_id}", response_model=StateResponse)
def update_state(
    state_id: int,
    data: StateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a state"""
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(state, field, value)

    db.commit()
    db.refresh(state)
    return state


@router.delete("/states/{state_id}")
def delete_state(
    state_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a state"""
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found")

    db.delete(state)
    db.commit()
    return {"message": "State deleted successfully"}


# ============ City Endpoints ============

@router.get("/cities", response_model=List[CityResponse])
def get_cities(
    state_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all cities, optionally filtered by state (public endpoint)"""
    query = db.query(City)
    if state_id:
        query = query.filter(City.state_id == state_id)
    if status:
        query = query.filter(City.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/cities/{city_id}", response_model=CityResponse)
def get_city(
    city_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a city"""
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.post("/cities", response_model=CityResponse)
def create_city(
    data: CityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new city"""
    # Verify state exists
    state = db.query(State).filter(State.id == data.state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found")

    city = City(**data.model_dump())
    db.add(city)
    db.commit()
    db.refresh(city)
    return city


@router.put("/cities/{city_id}", response_model=CityResponse)
def update_city(
    city_id: int,
    data: CityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a city"""
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(city, field, value)

    db.commit()
    db.refresh(city)
    return city


@router.delete("/cities/{city_id}")
def delete_city(
    city_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a city"""
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    db.delete(city)
    db.commit()
    return {"message": "City deleted successfully"}

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ Country Schemas ============

class CountryBase(BaseModel):
    name: str
    code: Optional[str] = None
    status: str = "Active"


class CountryCreate(CountryBase):
    pass


class CountryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    status: Optional[str] = None


class CountryResponse(CountryBase):
    id: int
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ State Schemas ============

class StateBase(BaseModel):
    name: str
    code: Optional[str] = None
    country_id: int
    status: str = "Active"


class StateCreate(StateBase):
    pass


class StateUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    country_id: Optional[int] = None
    status: Optional[str] = None


class StateResponse(StateBase):
    id: int
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class StateWithCountryResponse(StateResponse):
    country: Optional[CountryResponse] = None

    class Config:
        from_attributes = True


# ============ City Schemas ============

class CityBase(BaseModel):
    name: str
    state_id: int
    status: str = "Active"


class CityCreate(CityBase):
    pass


class CityUpdate(BaseModel):
    name: Optional[str] = None
    state_id: Optional[int] = None
    status: Optional[str] = None


class CityResponse(CityBase):
    id: int
    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class CityWithStateResponse(CityResponse):
    state: Optional[StateResponse] = None

    class Config:
        from_attributes = True


# ============ Combined Schemas ============

class CountryWithStatesResponse(CountryResponse):
    states: List[StateResponse] = []

    class Config:
        from_attributes = True


class StateWithCitiesResponse(StateResponse):
    cities: List[CityResponse] = []

    class Config:
        from_attributes = True

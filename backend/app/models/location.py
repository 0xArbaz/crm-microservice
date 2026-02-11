from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Country(Base):
    """Country table"""
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(10), nullable=True)  # ISO country code like US, IN, UK
    status = Column(String(20), default="Active")  # Active, Inactive
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to states
    states = relationship("State", back_populates="country", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Country {self.name}>"


class State(Base):
    """State table"""
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(10), nullable=True)  # State code like CA, NY, MH
    country_id = Column(Integer, ForeignKey("countries.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="Active")  # Active, Inactive
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    country = relationship("Country", back_populates="states")
    cities = relationship("City", back_populates="state", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<State {self.name}>"


class City(Base):
    """City table"""
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="Active")  # Active, Inactive
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    state = relationship("State", back_populates="cities")

    def __repr__(self):
        return f"<City {self.name}>"

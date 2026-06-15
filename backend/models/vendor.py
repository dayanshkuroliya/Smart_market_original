# models/vendor.py - Vendor/Haat owner database model
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    owner_name = Column(String(100), nullable=False)
    shop_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    daily_charge = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to daily collections
    collections = relationship("DailyCollection", back_populates="vendor", cascade="all, delete-orphan")

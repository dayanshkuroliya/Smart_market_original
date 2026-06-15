# models/collection.py - Daily charge collection model
from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, date
import enum
from database import Base

class PaymentStatus(str, enum.Enum):
    PAID = "Paid"
    PENDING = "Pending"
    NOT_PAID = "Not Paid"

class DailyCollection(Base):
    __tablename__ = "daily_collections"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    collection_date = Column(Date, default=date.today, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default=PaymentStatus.PENDING, nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to vendor
    vendor = relationship("Vendor", back_populates="collections")

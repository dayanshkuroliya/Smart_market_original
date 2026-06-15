# schemas/collection.py - Pydantic models for daily collection validation
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, Literal

class CollectionBase(BaseModel):
    vendor_id: int
    collection_date: date
    amount: float = Field(..., ge=0)
    status: Literal["Paid", "Pending", "Not Paid"]
    notes: Optional[str] = None

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    amount: Optional[float] = Field(None, ge=0)
    status: Optional[Literal["Paid", "Pending", "Not Paid"]] = None
    notes: Optional[str] = None

class CollectionResponse(CollectionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Flattened vendor info for convenience
    vendor_name: Optional[str] = None
    shop_name: Optional[str] = None

    class Config:
        from_attributes = True

class PendingPaymentResponse(BaseModel):
    """Response schema for pending/overdue payment listings."""
    collection_id: int
    vendor_id: int
    owner_name: str
    shop_name: str
    phone_number: Optional[str]
    amount_due: float
    collection_date: date
    days_pending: int
    status: str

# schemas/vendor.py - Pydantic models for vendor validation
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class VendorBase(BaseModel):
    owner_name: str = Field(..., min_length=1, max_length=100)
    shop_name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    daily_charge: float = Field(..., ge=0)

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    owner_name: Optional[str] = Field(None, min_length=1, max_length=100)
    shop_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    daily_charge: Optional[float] = Field(None, ge=0)

class VendorResponse(VendorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

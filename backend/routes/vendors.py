# routes/vendors.py - REST API endpoints for vendor management
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.user import User
from schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from services.vendor import get_all_vendors, get_vendor_by_id, create_vendor, update_vendor, delete_vendor
from services.auth import get_current_user

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])

@router.get("/", response_model=List[VendorResponse])
def list_vendors(
    search: Optional[str] = Query(None, description="Search by owner or shop name"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Get all vendors with optional search filter."""
    return get_all_vendors(db, search)

@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return get_vendor_by_id(db, vendor_id)

@router.post("/", response_model=VendorResponse, status_code=201)
def add_vendor(vendor_data: VendorCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Add a new vendor."""
    return create_vendor(db, vendor_data)

@router.put("/{vendor_id}", response_model=VendorResponse)
def edit_vendor(vendor_id: int, vendor_data: VendorUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Update vendor details."""
    return update_vendor(db, vendor_id, vendor_data)

@router.delete("/{vendor_id}")
def remove_vendor(vendor_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Delete a vendor and all their collection records."""
    return delete_vendor(db, vendor_id)

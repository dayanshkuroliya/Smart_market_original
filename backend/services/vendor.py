# services/vendor.py - Business logic for vendor management
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from models.vendor import Vendor
from schemas.vendor import VendorCreate, VendorUpdate
from fastapi import HTTPException, status

def get_all_vendors(db: Session, search: Optional[str] = None) -> List[Vendor]:
    """Fetch all vendors, optionally filtered by search query."""
    query = db.query(Vendor)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Vendor.owner_name.ilike(search_term),
                Vendor.shop_name.ilike(search_term),
            )
        )
    return query.order_by(Vendor.created_at.desc()).all()

def get_vendor_by_id(db: Session, vendor_id: int) -> Vendor:
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")
    return vendor

def create_vendor(db: Session, vendor_data: VendorCreate) -> Vendor:
    vendor = Vendor(**vendor_data.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor

def update_vendor(db: Session, vendor_id: int, vendor_data: VendorUpdate) -> Vendor:
    vendor = get_vendor_by_id(db, vendor_id)
    update_data = vendor_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vendor, field, value)
    db.commit()
    db.refresh(vendor)
    return vendor

def delete_vendor(db: Session, vendor_id: int) -> dict:
    vendor = get_vendor_by_id(db, vendor_id)
    db.delete(vendor)
    db.commit()
    return {"message": f"Vendor '{vendor.owner_name}' deleted successfully"}

# routes/collections.py - REST API endpoints for daily charge collection
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from models.user import User
from schemas.collection import CollectionCreate, CollectionUpdate, CollectionResponse, PendingPaymentResponse
from services.collection import (
    create_collection, update_collection, get_vendor_history,
    get_pending_payments, get_today_collections
)
from services.auth import get_current_user

router = APIRouter(prefix="/api/collections", tags=["Collections"])

@router.post("/", response_model=CollectionResponse, status_code=201)
def add_collection(
    data: CollectionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Record a daily charge collection (Paid / Pending / Not Paid)."""
    col = create_collection(db, data)
    return CollectionResponse(
        id=col.id,
        vendor_id=col.vendor_id,
        collection_date=col.collection_date,
        amount=col.amount,
        status=col.status,
        notes=col.notes,
        created_at=col.created_at,
        updated_at=col.updated_at,
        vendor_name=col.vendor.owner_name if col.vendor else None,
        shop_name=col.vendor.shop_name if col.vendor else None,
    )

@router.put("/{collection_id}", response_model=CollectionResponse)
def edit_collection(
    collection_id: int,
    data: CollectionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Update payment status of an existing collection."""
    col = update_collection(db, collection_id, data)
    return CollectionResponse(
        id=col.id,
        vendor_id=col.vendor_id,
        collection_date=col.collection_date,
        amount=col.amount,
        status=col.status,
        notes=col.notes,
        created_at=col.created_at,
        updated_at=col.updated_at,
        vendor_name=col.vendor.owner_name if col.vendor else None,
        shop_name=col.vendor.shop_name if col.vendor else None,
    )

@router.get("/today", response_model=List[dict])
def today_collections(
    target_date: Optional[date] = Query(None, description="Date to fetch (default: today)"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Get all collection entries for today (or a given date)."""
    return get_today_collections(db, target_date)

@router.get("/pending", response_model=List[PendingPaymentResponse])
def pending_payments(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Get all outstanding (Pending / Not Paid) collections."""
    return get_pending_payments(db)

@router.get("/vendor/{vendor_id}/history", response_model=List[CollectionResponse])
def vendor_history(
    vendor_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Get collection history for a specific vendor."""
    records = get_vendor_history(db, vendor_id, start_date, end_date)
    return [
        CollectionResponse(
            id=c.id,
            vendor_id=c.vendor_id,
            collection_date=c.collection_date,
            amount=c.amount,
            status=c.status,
            notes=c.notes,
            created_at=c.created_at,
            updated_at=c.updated_at,
            vendor_name=c.vendor.owner_name if c.vendor else None,
            shop_name=c.vendor.shop_name if c.vendor else None,
        )
        for c in records
    ]

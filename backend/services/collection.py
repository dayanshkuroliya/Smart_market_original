# services/collection.py - Business logic for daily collection tracking
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from typing import List, Optional
from datetime import date, datetime, timedelta
from models.collection import DailyCollection
from models.vendor import Vendor
from schemas.collection import CollectionCreate, CollectionUpdate, PendingPaymentResponse
from fastapi import HTTPException, status

def create_collection(db: Session, data: CollectionCreate) -> DailyCollection:
    """Create a new daily collection entry."""
    # Check for duplicate entry for same vendor on same date
    existing = db.query(DailyCollection).filter(
        and_(
            DailyCollection.vendor_id == data.vendor_id,
            DailyCollection.collection_date == data.collection_date
        )
    ).first()
    if existing:
        # Update instead of create
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    collection = DailyCollection(**data.model_dump())
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection

def update_collection(db: Session, collection_id: int, data: CollectionUpdate) -> DailyCollection:
    collection = db.query(DailyCollection).filter(DailyCollection.id == collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection record not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(collection, field, value)
    db.commit()
    db.refresh(collection)
    return collection

def get_vendor_history(
    db: Session,
    vendor_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[DailyCollection]:
    """Get collection history for a specific vendor."""
    query = db.query(DailyCollection).filter(DailyCollection.vendor_id == vendor_id)
    if start_date:
        query = query.filter(DailyCollection.collection_date >= start_date)
    if end_date:
        query = query.filter(DailyCollection.collection_date <= end_date)
    return query.order_by(DailyCollection.collection_date.desc()).all()

def get_pending_payments(db: Session) -> List[PendingPaymentResponse]:
    """Get all pending and not-paid collections with days overdue."""
    today = date.today()
    records = (
        db.query(DailyCollection, Vendor)
        .join(Vendor, DailyCollection.vendor_id == Vendor.id)
        .filter(DailyCollection.status.in_(["Pending", "Not Paid"]))
        .order_by(DailyCollection.collection_date.asc())
        .all()
    )

    result = []
    for collection, vendor in records:
        days_pending = (today - collection.collection_date).days
        result.append(PendingPaymentResponse(
            collection_id=collection.id,
            vendor_id=vendor.id,
            owner_name=vendor.owner_name,
            shop_name=vendor.shop_name,
            phone_number=vendor.phone_number,
            amount_due=collection.amount,
            collection_date=collection.collection_date,
            days_pending=days_pending,
            status=collection.status
        ))
    return result

def get_today_collections(db: Session, target_date: Optional[date] = None) -> List[dict]:
    """Get all collections for a specific date with vendor info."""
    target = target_date or date.today()
    records = (
        db.query(DailyCollection, Vendor)
        .join(Vendor, DailyCollection.vendor_id == Vendor.id)
        .filter(DailyCollection.collection_date == target)
        .all()
    )
    return [
        {
            "id": c.id,
            "vendor_id": v.id,
            "owner_name": v.owner_name,
            "shop_name": v.shop_name,
            "phone_number": v.phone_number,
            "daily_charge": v.daily_charge,
            "amount": c.amount,
            "status": c.status,
            "notes": c.notes,
            "collection_date": c.collection_date,
        }
        for c, v in records
    ]

def get_collection_trend(db: Session, days: int = 30) -> List[dict]:
    """Get daily collection trends for the last N days."""
    start = date.today() - timedelta(days=days)
    records = db.query(
          DailyCollection.collection_date,

    func.sum(
        case(
            (DailyCollection.status == "Paid", DailyCollection.amount),
            else_=0
        )
    ).label("total_collected"),

    func.sum(
        case(
            (DailyCollection.status.in_(["Pending", "Not Paid"]), DailyCollection.amount),
            else_=0
        )
    ).label("total_pending"),

    func.count(
        case(
            (DailyCollection.status == "Paid", 1)
        )
    ).label("paid_count"),

    func.count(
        case(
            (DailyCollection.status == "Pending", 1)
        )
    ).label("pending_count"),

    func.count(
        case(
            (DailyCollection.status == "Not Paid", 1)
        )
    ).label("not_paid_count"),
           ).filter(
        DailyCollection.collection_date >= start
    ).group_by(DailyCollection.collection_date).order_by(DailyCollection.collection_date).all()

    return [
        {
            "collection_date": r.collection_date,
            "total_collected": float(r.total_collected or 0),
            "total_pending": float(r.total_pending or 0),
            "paid_count": r.paid_count or 0,
            "pending_count": r.pending_count or 0,
            "not_paid_count": r.not_paid_count or 0,
        }
        for r in records
    ]

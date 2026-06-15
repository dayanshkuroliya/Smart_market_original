# services/dashboard.py - Dashboard summary computation
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from models.collection import DailyCollection
from models.vendor import Vendor
from schemas.dashboard import DashboardSummary, DailyTrend
from services.collection import get_collection_trend

def get_dashboard_summary(db: Session) -> DashboardSummary:
    today = date.today()

    # Total vendors
    total_vendors = db.query(func.count(Vendor.id)).scalar() or 0

    # Today's collections
    today_records = db.query(DailyCollection).filter(
        DailyCollection.collection_date == today
    ).all()

    paid_today = sum(1 for r in today_records if r.status == "Paid")
    pending_today = sum(1 for r in today_records if r.status == "Pending")
    not_paid_today = sum(1 for r in today_records if r.status == "Not Paid")
    total_collected_today = sum(r.amount for r in today_records if r.status == "Paid")

    # Total outstanding due amount (all time, pending/not paid)
    total_due = db.query(func.sum(DailyCollection.amount)).filter(
        DailyCollection.status.in_(["Pending", "Not Paid"])
    ).scalar() or 0.0

    # Unique vendors with pending/unpaid
    vendors_with_pending = db.query(func.count(func.distinct(DailyCollection.vendor_id))).filter(
        DailyCollection.status.in_(["Pending", "Not Paid"])
    ).scalar() or 0

    # 30-day trend
    trend_data = get_collection_trend(db, days=30)
    trend = [DailyTrend(**t) for t in trend_data]

    return DashboardSummary(
        total_vendors=total_vendors,
        total_collected_today=total_collected_today,
        paid_today=paid_today,
        pending_today=pending_today,
        not_paid_today=not_paid_today,
        total_due_amount=float(total_due),
        total_vendors_with_pending=vendors_with_pending,
        collection_trend=trend,
    )

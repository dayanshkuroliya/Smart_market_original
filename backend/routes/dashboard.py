# routes/dashboard.py - Dashboard summary and export endpoints
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
import io
from database import get_db
from models.user import User
from schemas.dashboard import DashboardSummary
from services.dashboard import get_dashboard_summary
from services.export import export_collections_csv, export_collections_excel
from services.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Get complete dashboard summary with totals and trend data."""
    return get_dashboard_summary(db)

@router.get("/export/csv")
def export_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Export collection records to CSV."""
    content = export_collections_csv(db, start_date, end_date)
    return StreamingResponse(
        io.StringIO(content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=collection_report.csv"}
    )

@router.get("/export/excel")
def export_excel(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Export collection records to Excel."""
    content = export_collections_excel(db, start_date, end_date)
    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=collection_report.xlsx"}
    )

# schemas/dashboard.py - Dashboard summary response schema
from pydantic import BaseModel
from typing import List
from datetime import date

class DailyTrend(BaseModel):
    collection_date: date
    total_collected: float
    total_pending: float
    paid_count: int
    pending_count: int
    not_paid_count: int

class DashboardSummary(BaseModel):
    total_vendors: int
    total_collected_today: float
    paid_today: int
    pending_today: int
    not_paid_today: int
    total_due_amount: float
    total_vendors_with_pending: int
    collection_trend: List[DailyTrend]

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
    # 1. 'not_paid_count' ko hata kar 'absent_count' kar diya
    absent_count: int

class DashboardSummary(BaseModel):
    total_vendors: int
    total_collected_today: float
    paid_today: int
    pending_today: int
    # 2. 'not_paid_today' ko hata kar 'absent_today' kar diya
    absent_today: int
    total_due_amount: float
    total_vendors_with_pending: int
    collection_trend: List[DailyTrend]
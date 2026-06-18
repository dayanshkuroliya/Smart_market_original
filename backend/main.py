# main.py - FastAPI application entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, SessionLocal, Base
from models.user import User
from services.auth import get_password_hash

# Import all routes
from routes.auth import router as auth_router
from routes.vendors import router as vendor_router
from routes.collections import router as collection_router
from routes.dashboard import router as dashboard_router

# Create all DB tables (Safe: automatically handles PostgreSQL or SQLite based on database.py)
Base.metadata.create_all(bind=engine)

# Lifespan context manager for startup and shutdown events (Modern way)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database with default admin
    db = SessionLocal()
    try:
        # Create default admin user only if no users exist
        if db.query(User).count() == 0:
            admin = User(
                username="admin",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin user created successfully")
        else:
            print("✅ Database already initialized")
    finally:
        db.close()
    
    yield  # Iske baad ka code shutdown par chalta hai (agar kuch ho toh)

app = FastAPI(
    title="Smart Market Charge Collection API",
    description="API for managing daily haat/market charge collection",
    version="1.0.0",
    lifespan=lifespan  # Registering lifespan here
)

# CORS — allow React dev server and live Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://smart-market-original.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth_router)
app.include_router(vendor_router)
app.include_router(collection_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "Smart Market Charge Collection API is running"}
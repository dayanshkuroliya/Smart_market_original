#  Smart Market – Charge Collection Management System

A complete full-stack web application for daily market charge collection management. Built for collectors who visit Haat owners (vendors/shopkeepers) every day and need to track who paid, who is pending, and who refused.

---

##  Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Python · FastAPI · SQLAlchemy · SQLite  |
| Frontend | React · Tailwind CSS · Axios · Chart.js |
| Auth     | JWT (python-jose + passlib/bcrypt)      |
| Export   | CSV · Excel (openpyxl)                  |

---

##  Project Structure

```
smart-market/
├── backend/
│   ├── main.py              # FastAPI entry point + sample data seed
│   ├── database.py          # SQLAlchemy engine + session
│   ├── requirements.txt
│   ├── models/
│   │   ├── vendor.py        # Vendor model
│   │   ├── collection.py    # DailyCollection model
│   │   └── user.py          # User model (auth)
│   ├── schemas/
│   │   ├── vendor.py        # Pydantic vendor schemas
│   │   ├── collection.py    # Pydantic collection schemas
│   │   ├── user.py          # Pydantic auth schemas
│   │   └── dashboard.py     # Pydantic dashboard schema
│   ├── routes/
│   │   ├── auth.py          # /api/auth/* endpoints
│   │   ├── vendors.py       # /api/vendors/* endpoints
│   │   ├── collections.py   # /api/collections/* endpoints
│   │   └── dashboard.py     # /api/dashboard/* + exports
│   └── services/
│       ├── auth.py          # JWT helpers
│       ├── vendor.py        # Vendor business logic
│       ├── collection.py    # Collection business logic
│       ├── dashboard.py     # Dashboard aggregation
│       └── export.py        # CSV/Excel export
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           # Router + auth guard
        ├── main.jsx
        ├── index.css         # Tailwind + custom classes
        ├── utils/
        │   ├── api.js        # Axios instance with JWT interceptor
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useDarkMode.js
        ├── components/
        │   ├── Layout.jsx    # App shell (sidebar + topbar)
        │   ├── Sidebar.jsx   # Navigation sidebar
        │   ├── StatCard.jsx  # Dashboard stat card
        │   ├── StatusBadge.jsx
        │   └── Spinner.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── VendorList.jsx
            ├── VendorForm.jsx      # Add + Edit vendor
            ├── DailyCollection.jsx
            ├── PendingPayments.jsx
            ├── PaymentHistory.jsx
            └── Analytics.jsx
```

---

## ⚙️ Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend starts at **http://localhost:8000**  
API docs: **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:3000**

---

## Default Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## 📡 API Endpoints

| Method | Endpoint                                  | Description               |
|--------|-------------------------------------------|---------------------------|
| POST   | /api/auth/login                           | Login, get JWT token       |
| GET    | /api/vendors/                             | List all vendors           |
| POST   | /api/vendors/                             | Add new vendor             |
| PUT    | /api/vendors/{id}                         | Update vendor              |
| DELETE | /api/vendors/{id}                         | Delete vendor              |
| POST   | /api/collections/                         | Record daily collection    |
| PUT    | /api/collections/{id}                     | Update payment status      |
| GET    | /api/collections/today                    | Today's collections        |
| GET    | /api/collections/pending                  | All pending/unpaid         |
| GET    | /api/collections/vendor/{id}/history      | Vendor payment history     |
| GET    | /api/dashboard/summary                    | Full dashboard summary     |
| GET    | /api/dashboard/export/csv                 | Export to CSV              |
| GET    | /api/dashboard/export/excel               | Export to Excel            |

---

## Features

- JWT Authentication (login/logout)
-  Vendor CRUD (add, edit, delete, search)
-  Daily collection with Paid / Pending / Not Paid status
-  Dashboard with live stats
-  Pending payments with overdue highlighting
-  Per-vendor payment history with date filter
-  Analytics charts (bar, line, doughnut)
-  Export to CSV and Excel
-  Dark mode support
-  Responsive mobile layout
-  Sample data auto-seeded on first run

---

## Future Enhancements

- WhatsApp reminder integration (API layer prepared)
- Multi-user / multi-market support
- Monthly billing summaries
- Offline PWA support

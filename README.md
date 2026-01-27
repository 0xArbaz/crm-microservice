# CRM Microservice

A complete CRM (Customer Relationship Management) microservice built with FastAPI (Backend) and Next.js (Frontend), designed to be independent from your main ERP system.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│   FastAPI API   │────▶│   PostgreSQL    │
│   (Port 3000)   │     │   (Port 8000)   │     │   (Port 5432)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │ Webhooks
                               ▼
                        ┌─────────────────┐
                        │   Laravel ERP   │
                        │   (External)    │
                        └─────────────────┘
```

## Modules Included

- **Dashboard** - KPIs, funnel visualization, recent activities
- **Pre-Lead Module** - Capture and validate raw inquiries
- **Lead Module** - Manage qualified prospects through sales pipeline
- **Customer Module** - Track converted customers
- **Activity Tracking** - Log all interactions
- **Contact Module** - Manage multiple contacts per lead/customer
- **Webhook Module** - Incoming/outgoing integrations
- **Marketing** - Bulk email and WhatsApp campaigns

## Tech Stack

- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Auth**: JWT

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone and Navigate

```bash
cd crm-microservice
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
# Run in psql or pgAdmin:
# CREATE DATABASE crm_db;

# Run migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Create admin user (run this Python script)
python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.core.permissions import UserRole

db = SessionLocal()
admin = User(
    email='admin@example.com',
    hashed_password=get_password_hash('admin123'),
    full_name='Admin User',
    role=UserRole.ADMIN
)
db.add(admin)
db.commit()
print('Admin user created!')
db.close()
"

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

### 4. Login

- URL: http://localhost:3000/login
- Email: admin@example.com
- Password: admin123

---

## API Documentation

### Authentication

```bash
# Login
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Response
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { ... }
}
```

### Pre-Leads

```bash
# Create Pre-Lead
POST /api/v1/pre-leads
Authorization: Bearer <token>
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "source": "website",
  "company_name": "Acme Corp"
}

# List Pre-Leads
GET /api/v1/pre-leads?page=1&status=new

# Validate Pre-Lead (Convert to Lead)
POST /api/v1/pre-leads/{id}/validate
{
  "priority": "high",
  "expected_value": 100000
}

# Discard Pre-Lead
POST /api/v1/pre-leads/{id}/discard
{
  "discard_reason": "Invalid contact information"
}
```

### Leads

```bash
# Create Lead
POST /api/v1/leads
{
  "first_name": "Jane",
  "company_name": "Tech Corp",
  "email": "jane@techcorp.com",
  "source": "referral",
  "expected_value": 500000,
  "priority": "high"
}

# Update Lead Stage
PUT /api/v1/leads/{id}/stage?stage=3

# Convert Lead to Customer
POST /api/v1/leads/{id}/convert
{
  "customer_type": "business",
  "notes": "Converted after successful negotiation"
}

# Discard Lead
POST /api/v1/leads/{id}/discard
{
  "loss_reason": "Went with competitor"
}
```

### Customers

```bash
# List Customers
GET /api/v1/customers?status=active

# Get Customer
GET /api/v1/customers/{id}

# Update Customer Health Score
PUT /api/v1/customers/{id}/health-score?health_score=85
```

### Activities

```bash
# Create Activity
POST /api/v1/activities
{
  "activity_type": "call",
  "subject": "Initial discovery call",
  "description": "Discussed requirements",
  "lead_id": 1,
  "outcome": "follow_up_needed"
}

# Get Lead Activities
GET /api/v1/activities/lead/{lead_id}

# Complete Activity
POST /api/v1/activities/{id}/complete?outcome=successful
```

### Webhooks

```bash
# Incoming Webhook (from ERP/Website)
POST /api/v1/webhooks/incoming
{
  "event": "new_inquiry",
  "source": "website",
  "data": {
    "first_name": "New",
    "last_name": "Lead",
    "email": "new@example.com",
    "phone": "+91 98765 43210"
  }
}
```

### Marketing

```bash
# Send Bulk Email
POST /api/v1/marketing/bulk-email
{
  "subject": "Special Offer",
  "body": "Dear {{name}}, ...",
  "recipient_type": "lead"
}

# Preview Recipients
GET /api/v1/marketing/bulk-email/preview?recipient_type=lead

# Send WhatsApp Messages
POST /api/v1/marketing/whatsapp
{
  "template_name": "welcome_message",
  "recipient_type": "lead"
}
```

---

## ERP Integration

### Incoming Webhooks (ERP → CRM)

Configure your Laravel ERP to send webhooks to CRM:

```php
// Laravel ERP - Send new inquiry to CRM
Http::post('http://crm-service:8000/api/v1/webhooks/incoming', [
    'event' => 'new_inquiry',
    'source' => 'erp',
    'data' => [
        'first_name' => $inquiry->first_name,
        'email' => $inquiry->email,
        'phone' => $inquiry->phone,
        'product_interest' => $inquiry->product,
    ]
]);
```

### Outgoing Webhooks (CRM → ERP)

Configure outgoing webhooks in CRM to notify ERP:

- `lead_validated` - When pre-lead is validated
- `lead_converted` - When lead becomes customer
- `customer_created` - When new customer is created

---

## Folder Structure

```
crm-microservice/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API routes
│   │   ├── core/                # Config, security, database
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   └── services/            # Business logic
│   ├── migrations/              # Alembic migrations
│   ├── main.py                  # FastAPI app
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # API client, utilities
│   │   ├── stores/              # Zustand state
│   │   └── types/               # TypeScript types
│   └── package.json
│
└── README.md
```

---

## User Roles & Permissions

| Role | Pre-Leads | Leads | Customers | Activities | Webhooks |
|------|-----------|-------|-----------|------------|----------|
| Admin | Full | Full | Full | Full | Full |
| Manager | Full | Full | Read | Full | Read |
| Sales | Create/Read | Own | Read | Own | None |
| Marketing | Read | Read | None | Read | Read |

---

## Production Deployment

### Backend

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## License

MIT License

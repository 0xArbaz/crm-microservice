# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRM Microservice - A customer relationship management system with FastAPI backend and Next.js frontend, designed for integration with external ERP systems via webhooks.

## Development Commands

### Backend (FastAPI)

```bash
cd backend

# Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run database migrations
alembic revision --autogenerate -m "Migration message"
alembic upgrade head

# Initialize database with admin user and sample data
python init_db.py

# Production server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend (Next.js)

```bash
cd frontend

npm install          # Install dependencies
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint
```

## Architecture

```
Frontend (Next.js :3000) → Backend (FastAPI :8000) → PostgreSQL (:5432)
                                    ↓
                          Webhooks ↔ External ERP
```

### Backend Structure (`backend/app/`)

- `api/v1/endpoints/` - Route handlers for each module (auth, pre_leads, leads, customers, activities, dashboard, webhooks, marketing)
- `api/v1/router.py` - Route aggregation
- `api/deps.py` - FastAPI dependency injection (get_db, get_current_user)
- `core/config.py` - Environment settings via Pydantic Settings
- `core/database.py` - SQLAlchemy engine and session factory
- `core/security.py` - JWT token handling and bcrypt password hashing
- `core/permissions.py` - Role-based access control with `@require_permission()` decorator
- `models/` - SQLAlchemy ORM models
- `schemas/` - Pydantic validation schemas (Create/Update/Response pattern)

### Frontend Structure (`frontend/src/`)

- `app/` - Next.js App Router pages
- `components/layout/` - MainLayout, Header, Sidebar
- `components/ui/` - Reusable UI components (Button, Card, Input, Table, Modal, Badge)
- `lib/api.ts` - Axios client with JWT interceptors (auto-attaches token, handles 401)
- `stores/auth.ts` - Zustand auth store with localStorage persistence
- `types/index.ts` - TypeScript interfaces for all entities

## Key Patterns

### RBAC (Role-Based Access Control)

User roles: `admin`, `manager`, `sales`, `marketing`, `support`

```python
from app.core.permissions import require_permission

@router.post("/")
@require_permission("leads", "create")
async def create_lead(...):
```

### API Routes

All API endpoints under `/api/v1/`. Documentation at `/docs` (Swagger) and `/redoc`.

### Data Flow

Pre-Lead → Lead (validation) → Customer (conversion)

Conversion tracking via `is_converted`, `converted_at`, `converted_*_id` fields.

### Database Sessions

Use FastAPI dependency injection:
```python
from app.api.deps import get_db
def endpoint(db: Session = Depends(get_db)):
```

### Frontend API Calls

```typescript
import { apiService } from '@/lib/api';
const leads = await apiService.get('/api/v1/leads');
```

## Default Credentials

- Email: `admin@example.com`
- Password: `admin123`

## Webhook Events

Outgoing: `lead_validated`, `lead_converted`, `customer_created`
Incoming endpoint: `POST /api/v1/webhooks/incoming`

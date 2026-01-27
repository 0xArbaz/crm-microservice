from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    dashboard,
    pre_leads,
    leads,
    customers,
    contacts,
    activities,
    sales_targets,
    webhooks,
    marketing
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Users
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Dashboard
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# Pre-Leads
api_router.include_router(pre_leads.router, prefix="/pre-leads", tags=["Pre-Leads"])

# Leads
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])

# Customers
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])

# Contacts
api_router.include_router(contacts.router, prefix="/contacts", tags=["Contacts"])

# Activities
api_router.include_router(activities.router, prefix="/activities", tags=["Activities"])

# Sales Targets
api_router.include_router(sales_targets.router, prefix="/sales-targets", tags=["Sales Targets"])

# Webhooks
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])

# Marketing (Bulk Email, WhatsApp)
api_router.include_router(marketing.router, prefix="/marketing", tags=["Marketing"])

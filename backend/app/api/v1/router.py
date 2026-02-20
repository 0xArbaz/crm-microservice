from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    dashboard,
    pre_leads,
    pre_lead_entities,
    leads,
    lead_entities,
    customers,
    contacts,
    activities,
    sales_targets,
    webhooks,
    marketing,
    customer_requirements,
    option_master,
    location,
    cri_email_template,
    public_forms
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

# Pre-Lead Entities (Contacts, Activities, Memos, Documents, Status, Qualified Profiles)
api_router.include_router(pre_lead_entities.router, prefix="/pre-leads", tags=["Pre-Lead Entities"])

# Lead Entities (Contacts, Activities, Memos, Documents, Status, Qualified Profiles)
# NOTE: Must come BEFORE leads.router so /all-contacts matches before /{lead_id}
api_router.include_router(lead_entities.router, prefix="/leads", tags=["Lead Entities"])

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

# Customer Requirements
api_router.include_router(customer_requirements.router, prefix="/customer-requirements", tags=["Customer Requirements"])

# Option Master
api_router.include_router(option_master.router, prefix="/options", tags=["Option Master"])

# Location (Countries, States, Cities)
api_router.include_router(location.router, prefix="/location", tags=["Location"])

# CRI Email Templates
api_router.include_router(cri_email_template.router, prefix="/cri-email-templates", tags=["CRI Email Templates"])

# Public Forms (no authentication required)
api_router.include_router(public_forms.router, prefix="/public/forms", tags=["Public Forms"])

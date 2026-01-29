from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserLogin, Token
from app.schemas.pre_lead import PreLeadCreate, PreLeadUpdate, PreLeadResponse, PreLeadValidate
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadConvert
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.schemas.sales_target import SalesTargetCreate, SalesTargetUpdate, SalesTargetResponse
from app.schemas.webhook import (
    WebhookConfigCreate, WebhookConfigUpdate, WebhookConfigResponse,
    WebhookLogResponse, IncomingWebhookPayload
)
from app.schemas.dashboard import DashboardStats, FunnelData, RecentActivity
from app.schemas.pre_lead_entities import (
    PreLeadContactCreate, PreLeadContactUpdate, PreLeadContactResponse,
    PreLeadActivityCreate, PreLeadActivityUpdate, PreLeadActivityResponse,
    PreLeadMemoCreate, PreLeadMemoUpdate, PreLeadMemoResponse,
    PreLeadDocumentCreate, PreLeadDocumentResponse,
    PreLeadStatusHistoryCreate, PreLeadStatusHistoryResponse,
    QualifiedLeadProfileCreate, QualifiedLeadProfileUpdate, QualifiedLeadProfileResponse,
    PreLeadFullResponse
)

__all__ = [
    # User
    "UserCreate", "UserUpdate", "UserResponse", "UserLogin", "Token",
    # Pre-Lead
    "PreLeadCreate", "PreLeadUpdate", "PreLeadResponse", "PreLeadValidate",
    # Pre-Lead Entities
    "PreLeadContactCreate", "PreLeadContactUpdate", "PreLeadContactResponse",
    "PreLeadActivityCreate", "PreLeadActivityUpdate", "PreLeadActivityResponse",
    "PreLeadMemoCreate", "PreLeadMemoUpdate", "PreLeadMemoResponse",
    "PreLeadDocumentCreate", "PreLeadDocumentResponse",
    "PreLeadStatusHistoryCreate", "PreLeadStatusHistoryResponse",
    "QualifiedLeadProfileCreate", "QualifiedLeadProfileUpdate", "QualifiedLeadProfileResponse",
    "PreLeadFullResponse",
    # Lead
    "LeadCreate", "LeadUpdate", "LeadResponse", "LeadConvert",
    # Customer
    "CustomerCreate", "CustomerUpdate", "CustomerResponse",
    # Contact
    "ContactCreate", "ContactUpdate", "ContactResponse",
    # Activity
    "ActivityCreate", "ActivityUpdate", "ActivityResponse",
    # Sales Target
    "SalesTargetCreate", "SalesTargetUpdate", "SalesTargetResponse",
    # Webhook
    "WebhookConfigCreate", "WebhookConfigUpdate", "WebhookConfigResponse",
    "WebhookLogResponse", "IncomingWebhookPayload",
    # Dashboard
    "DashboardStats", "FunnelData", "RecentActivity",
]

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
import json
import httpx

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.webhook_setting import MenuWebhookSetting, MenuWebhookConfig
from app.core.permissions import check_permission

router = APIRouter()


# ================== SCHEMAS ==================

class MenuItemSchema(BaseModel):
    menu_key: str
    menu_name: str
    menu_path: str
    is_enabled: bool = False


class MenuWebhookSettingResponse(BaseModel):
    id: int
    menu_key: str
    menu_name: str
    menu_path: str
    is_enabled: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MenuWebhookSettingUpdate(BaseModel):
    is_enabled: bool


class WebhookConfigSchema(BaseModel):
    webhook_url: Optional[str] = None
    secret_key: Optional[str] = None
    events: Optional[List[str]] = None
    is_active: bool = False


class WebhookConfigResponse(BaseModel):
    id: int
    menu_key: str
    webhook_url: Optional[str] = None
    secret_key: Optional[str] = None
    events: Optional[List[str]] = None
    is_active: bool = False
    last_triggered_at: Optional[datetime] = None
    last_status: Optional[str] = None
    last_error: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ================== DEFAULT MENUS ==================

DEFAULT_MENUS = [
    # Dashboard
    {"menu_key": "dashboard", "menu_name": "Dashboard", "menu_path": "/dashboard"},

    # Pre-Leads
    {"menu_key": "pre-leads-new", "menu_name": "Pre-Leads > New Pre-Lead", "menu_path": "/pre-leads/new"},
    {"menu_key": "pre-leads-manage", "menu_name": "Pre-Leads > Manage Pre-Leads", "menu_path": "/pre-leads"},
    {"menu_key": "pre-leads-validate", "menu_name": "Pre-Leads > Validate Pre-Leads", "menu_path": "/pre-leads/validate"},
    {"menu_key": "pre-leads-discarded", "menu_name": "Pre-Leads > Discarded", "menu_path": "/pre-leads/discarded"},

    # Leads
    {"menu_key": "leads-new", "menu_name": "Leads > New Lead", "menu_path": "/leads/new"},
    {"menu_key": "leads-manage", "menu_name": "Leads > Manage Leads", "menu_path": "/leads"},
    {"menu_key": "leads-track", "menu_name": "Leads > Track Lead", "menu_path": "/leads/track"},
    {"menu_key": "leads-discarded", "menu_name": "Leads > Discarded", "menu_path": "/leads/discarded"},
    {"menu_key": "leads-sales-target", "menu_name": "Leads > Sales Target", "menu_path": "/leads/sales-target"},
    {"menu_key": "leads-bulk-email", "menu_name": "Leads > Bulk Email", "menu_path": "/leads/bulk-email"},
    {"menu_key": "leads-whatsapp", "menu_name": "Leads > WhatsApp Marketing", "menu_path": "/leads/whatsapp"},
    {"menu_key": "leads-agent", "menu_name": "Leads > Lead Agent", "menu_path": "/leads/agent"},

    # Customers
    {"menu_key": "customers-track", "menu_name": "Customers > Track Customers", "menu_path": "/customers"},

    # Activities
    {"menu_key": "activities-lead", "menu_name": "Activities > Lead Activity", "menu_path": "/activities/lead"},
    {"menu_key": "activities-customer", "menu_name": "Activities > Customer Activity", "menu_path": "/activities/customer"},

    # Contacts
    {"menu_key": "contacts-lead", "menu_name": "Contacts > Lead Contacts", "menu_path": "/contacts/lead"},
    {"menu_key": "contacts-customer", "menu_name": "Contacts > Customer Contacts", "menu_path": "/contacts/customer"},

    # Webhooks (top-level)
    {"menu_key": "webhooks", "menu_name": "Webhooks", "menu_path": "/webhooks"},

    # Settings
    {"menu_key": "settings-option-master", "menu_name": "Settings > Option Master", "menu_path": "/settings/option-master"},
    {"menu_key": "settings-webhook", "menu_name": "Settings > Webhook Setting", "menu_path": "/settings/webhook"},
    {"menu_key": "settings-general", "menu_name": "Settings > General Settings", "menu_path": "/settings"},
]


# ================== ENDPOINTS ==================

@router.get("/settings", response_model=List[MenuWebhookSettingResponse])
def get_webhook_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all webhook settings for all menus"""
    try:
        # Get existing settings
        existing_settings = db.query(MenuWebhookSetting).all()
        existing_keys = {s.menu_key for s in existing_settings}

        # Add any missing menus
        for menu in DEFAULT_MENUS:
            if menu["menu_key"] not in existing_keys:
                new_setting = MenuWebhookSetting(
                    menu_key=menu["menu_key"],
                    menu_name=menu["menu_name"],
                    menu_path=menu["menu_path"],
                    is_enabled=False
                )
                db.add(new_setting)

        db.commit()

        # Return all settings
        settings = db.query(MenuWebhookSetting).order_by(MenuWebhookSetting.id).all()
        return settings
    except Exception as e:
        print(f"Error getting webhook settings: {e}")
        # Return default menus if table doesn't exist
        return [
            MenuWebhookSettingResponse(
                id=i+1,
                menu_key=m["menu_key"],
                menu_name=m["menu_name"],
                menu_path=m["menu_path"],
                is_enabled=False
            )
            for i, m in enumerate(DEFAULT_MENUS)
        ]


@router.put("/settings/{menu_key}")
def update_webhook_setting(
    menu_key: str,
    update: MenuWebhookSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enable or disable webhook for a specific menu"""
    try:
        # Check if table exists by trying to query
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        if 'menu_webhook_settings' not in inspector.get_table_names():
            # Table doesn't exist - return success but don't persist
            # User needs to run migration: alembic upgrade head
            print("WARNING: menu_webhook_settings table does not exist. Run 'alembic upgrade head'")
            return {"success": True, "menu_key": menu_key, "is_enabled": update.is_enabled, "warning": "Database migration pending"}

        setting = db.query(MenuWebhookSetting).filter(MenuWebhookSetting.menu_key == menu_key).first()

        if not setting:
            # Create new setting if not exists
            menu_info = next((m for m in DEFAULT_MENUS if m["menu_key"] == menu_key), None)
            if not menu_info:
                raise HTTPException(status_code=404, detail="Menu not found")

            setting = MenuWebhookSetting(
                menu_key=menu_key,
                menu_name=menu_info["menu_name"],
                menu_path=menu_info["menu_path"],
                is_enabled=update.is_enabled
            )
            db.add(setting)
        else:
            setting.is_enabled = update.is_enabled

        db.commit()
        db.refresh(setting)

        return {"success": True, "menu_key": menu_key, "is_enabled": setting.is_enabled}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating webhook setting: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update setting: {str(e)}")


@router.get("/settings/check/{menu_path:path}")
def check_webhook_enabled(
    menu_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if webhook is enabled for a specific menu path"""
    try:
        # Normalize path
        if not menu_path.startswith("/"):
            menu_path = "/" + menu_path

        setting = db.query(MenuWebhookSetting).filter(MenuWebhookSetting.menu_path == menu_path).first()

        if setting:
            return {"is_enabled": setting.is_enabled, "menu_key": setting.menu_key}

        return {"is_enabled": False, "menu_key": None}
    except Exception as e:
        print(f"Error checking webhook status: {e}")
        return {"is_enabled": False, "menu_key": None}


@router.get("/config/{menu_key}", response_model=WebhookConfigResponse)
def get_webhook_config(
    menu_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get webhook configuration for a specific menu"""
    try:
        config = db.query(MenuWebhookConfig).filter(MenuWebhookConfig.menu_key == menu_key).first()

        if not config:
            # Return empty config
            return WebhookConfigResponse(
                id=0,
                menu_key=menu_key,
                webhook_url=None,
                secret_key=None,
                events=[],
                is_active=False
            )

        # Parse events JSON
        events = []
        if config.events:
            try:
                events = json.loads(config.events)
            except:
                events = []

        return WebhookConfigResponse(
            id=config.id,
            menu_key=config.menu_key,
            webhook_url=config.webhook_url,
            secret_key=config.secret_key,
            events=events,
            is_active=config.is_active,
            last_triggered_at=config.last_triggered_at,
            last_status=config.last_status,
            last_error=config.last_error,
            created_at=config.created_at,
            updated_at=config.updated_at
        )
    except Exception as e:
        print(f"Error getting webhook config: {e}")
        return WebhookConfigResponse(
            id=0,
            menu_key=menu_key,
            webhook_url=None,
            secret_key=None,
            events=[],
            is_active=False
        )


@router.put("/config/{menu_key}")
def update_webhook_config(
    menu_key: str,
    config_update: WebhookConfigSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update webhook configuration for a specific menu"""
    try:
        config = db.query(MenuWebhookConfig).filter(MenuWebhookConfig.menu_key == menu_key).first()

        events_json = json.dumps(config_update.events) if config_update.events else None

        if not config:
            config = MenuWebhookConfig(
                menu_key=menu_key,
                webhook_url=config_update.webhook_url,
                secret_key=config_update.secret_key,
                events=events_json,
                is_active=config_update.is_active
            )
            db.add(config)
        else:
            config.webhook_url = config_update.webhook_url
            config.secret_key = config_update.secret_key
            config.events = events_json
            config.is_active = config_update.is_active

        db.commit()
        db.refresh(config)

        return {"success": True, "menu_key": menu_key, "is_active": config.is_active}
    except Exception as e:
        print(f"Error updating webhook config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update configuration")


@router.post("/config/{menu_key}/test")
async def test_webhook(
    menu_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test webhook configuration by sending a test request"""
    try:
        config = db.query(MenuWebhookConfig).filter(MenuWebhookConfig.menu_key == menu_key).first()

        if not config or not config.webhook_url:
            raise HTTPException(status_code=400, detail="Webhook URL not configured")

        # Prepare test payload
        test_payload = {
            "event": "test",
            "menu_key": menu_key,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "This is a test webhook from CRM System"
        }

        headers = {
            "Content-Type": "application/json"
        }

        if config.secret_key:
            headers["X-Webhook-Secret"] = config.secret_key

        # Send test request
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                config.webhook_url,
                json=test_payload,
                headers=headers
            )

        # Update last status
        config.last_triggered_at = datetime.utcnow()
        config.last_status = "success" if response.status_code < 400 else "failed"
        config.last_error = None if response.status_code < 400 else f"HTTP {response.status_code}"
        db.commit()

        return {
            "success": response.status_code < 400,
            "status_code": response.status_code,
            "message": "Webhook test sent successfully" if response.status_code < 400 else f"Webhook returned error: {response.status_code}"
        }

    except httpx.TimeoutException:
        if config:
            config.last_triggered_at = datetime.utcnow()
            config.last_status = "failed"
            config.last_error = "Connection timeout"
            db.commit()
        return {"success": False, "message": "Connection timeout"}
    except httpx.RequestError as e:
        if config:
            config.last_triggered_at = datetime.utcnow()
            config.last_status = "failed"
            config.last_error = str(e)
            db.commit()
        return {"success": False, "message": f"Connection error: {str(e)}"}
    except Exception as e:
        print(f"Error testing webhook: {e}")
        return {"success": False, "message": str(e)}


@router.get("/enabled-paths")
def get_enabled_webhook_paths(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of all enabled webhook paths"""
    try:
        settings = db.query(MenuWebhookSetting).filter(MenuWebhookSetting.is_enabled == True).all()
        return {
            "paths": [
                {"menu_key": s.menu_key, "menu_path": s.menu_path}
                for s in settings
            ]
        }
    except Exception as e:
        print(f"Error getting enabled paths: {e}")
        return {"paths": []}

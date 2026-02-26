from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class MenuWebhookSetting(Base):
    """Store webhook enable/disable status for each menu"""
    __tablename__ = "menu_webhook_settings"

    id = Column(Integer, primary_key=True, index=True)
    menu_key = Column(String(100), unique=True, nullable=False, index=True)  # Unique identifier for menu
    menu_name = Column(String(255), nullable=False)  # Display name
    menu_path = Column(String(255), nullable=False)  # Route path
    is_enabled = Column(Boolean, default=False)  # Webhook enabled status

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<MenuWebhookSetting {self.menu_key}: {self.is_enabled}>"


class MenuWebhookConfig(Base):
    """Store webhook configuration for each menu"""
    __tablename__ = "menu_webhook_configs"

    id = Column(Integer, primary_key=True, index=True)
    menu_key = Column(String(100), unique=True, nullable=False, index=True)  # Links to MenuWebhookSetting
    webhook_url = Column(String(500), nullable=True)
    secret_key = Column(String(255), nullable=True)
    events = Column(Text, nullable=True)  # JSON array of selected events
    is_active = Column(Boolean, default=False)  # Whether webhook is actively sending
    last_triggered_at = Column(DateTime(timezone=True), nullable=True)
    last_status = Column(String(50), nullable=True)  # success, failed, pending
    last_error = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<MenuWebhookConfig {self.menu_key}>"

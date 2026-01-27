from enum import Enum
from typing import List
from functools import wraps
from fastapi import HTTPException, status


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    SALES = "sales"
    MARKETING = "marketing"
    SUPPORT = "support"


# Permission definitions per module
PERMISSIONS = {
    "pre_leads": {
        UserRole.ADMIN: ["create", "read", "update", "delete", "validate", "discard"],
        UserRole.MANAGER: ["create", "read", "update", "validate", "discard"],
        UserRole.SALES: ["create", "read", "update"],
        UserRole.MARKETING: ["read"],
        UserRole.SUPPORT: [],
    },
    "leads": {
        UserRole.ADMIN: ["create", "read", "update", "delete", "convert", "discard", "bulk_email", "whatsapp"],
        UserRole.MANAGER: ["create", "read", "update", "convert", "discard", "bulk_email", "whatsapp"],
        UserRole.SALES: ["create", "read", "update", "convert"],
        UserRole.MARKETING: ["read", "bulk_email", "whatsapp"],
        UserRole.SUPPORT: [],
    },
    "customers": {
        UserRole.ADMIN: ["create", "read", "update", "delete"],
        UserRole.MANAGER: ["read", "update"],
        UserRole.SALES: ["read"],
        UserRole.MARKETING: [],
        UserRole.SUPPORT: ["read"],
    },
    "activities": {
        UserRole.ADMIN: ["create", "read", "update", "delete"],
        UserRole.MANAGER: ["create", "read", "update"],
        UserRole.SALES: ["create", "read", "update"],
        UserRole.MARKETING: ["read"],
        UserRole.SUPPORT: ["read"],
    },
    "contacts": {
        UserRole.ADMIN: ["create", "read", "update", "delete"],
        UserRole.MANAGER: ["create", "read", "update"],
        UserRole.SALES: ["create", "read", "update"],
        UserRole.MARKETING: [],
        UserRole.SUPPORT: ["read"],
    },
    "webhooks": {
        UserRole.ADMIN: ["create", "read", "update", "delete"],
        UserRole.MANAGER: ["read"],
        UserRole.SALES: [],
        UserRole.MARKETING: ["read"],
        UserRole.SUPPORT: [],
    },
    "sales_targets": {
        UserRole.ADMIN: ["create", "read", "update", "delete"],
        UserRole.MANAGER: ["create", "read", "update"],
        UserRole.SALES: ["read"],
        UserRole.MARKETING: [],
        UserRole.SUPPORT: [],
    },
}


def check_permission(role: UserRole, module: str, action: str) -> bool:
    """Check if a role has permission for an action on a module"""
    if module not in PERMISSIONS:
        return False
    if role not in PERMISSIONS[module]:
        return False
    return action in PERMISSIONS[module][role]


def require_permission(module: str, action: str):
    """Decorator to check permissions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current_user from kwargs
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )

            if not check_permission(current_user.role, module, action):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied for {action} on {module}"
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator

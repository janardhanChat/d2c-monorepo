"""Supabase JWT verification - the Python twin of packages/auth."""

from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel

from app.config import Settings, get_settings


class AuthUser(BaseModel):
    id: str
    email: str | None = None
    role: str = "authenticated"


class TenantContext(BaseModel):
    organization_id: str
    brand_id: str | None


def current_user(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> AuthUser:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Valid session required")
    if not settings.supabase_jwt_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Auth is not configured")
    token = authorization.split(" ", 1)[1]
    try:
        claims = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience=settings.supabase_jwt_audience,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc
    return AuthUser(
        id=claims["sub"], email=claims.get("email"), role=claims.get("role", "authenticated")
    )


def tenant(
    x_organization_id: Annotated[str, Header()],
    x_brand_id: Annotated[str | None, Header()] = None,
) -> TenantContext:
    # Membership is checked by the caller (product services) before they reach the AI engine.
    return TenantContext(organization_id=x_organization_id, brand_id=x_brand_id)


CurrentUser = Annotated[AuthUser, Depends(current_user)]
CurrentTenant = Annotated[TenantContext, Depends(tenant)]

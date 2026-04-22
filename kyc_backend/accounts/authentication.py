"""
Custom DRF authentication class for invite-token-based applicant sessions.

The applicant sends their session token via:
    Authorization: Applicant <token>

This authenticates them as a lightweight "applicant principal" — not a Django
User instance, but a proxy object that satisfies DRF's auth contract.
"""
from __future__ import annotations

import uuid
from typing import Optional, Tuple

from django.utils import timezone
from rest_framework import authentication, exceptions


class ApplicantPrincipal:
    """
    Lightweight proxy that quacks like a Django user for DRF purposes.
    Wraps an Applicant model instance.
    """

    def __init__(self, applicant):
        self._applicant = applicant

    # DRF / Django auth contract
    is_authenticated = True
    is_anonymous = False
    is_staff = False
    is_superuser = False
    is_applicant = True

    @property
    def applicant_id(self):
        return self._applicant.pk

    @property
    def pk(self):
        return self._applicant.pk

    @property
    def id(self):
        return self._applicant.pk

    @property
    def full_name(self):
        return self._applicant.full_name

    @property
    def email(self):
        return self._applicant.email

    def __str__(self):
        return f"ApplicantPrincipal({self._applicant})"


class ApplicantTokenAuthentication(authentication.BaseAuthentication):
    """
    Authenticate applicants via a session token stored in the Applicant model.
    Header format:  Authorization: Applicant <session_token>
    """

    keyword = "Applicant"

    def authenticate(self, request) -> Optional[Tuple[ApplicantPrincipal, str]]:
        auth_header = authentication.get_authorization_header(request).decode("utf-8")
        if not auth_header or not auth_header.startswith(f"{self.keyword} "):
            return None

        token_str = auth_header[len(self.keyword) + 1:].strip()
        if not token_str:
            return None

        return self._authenticate_token(token_str)

    def _authenticate_token(self, token_str: str) -> Tuple[ApplicantPrincipal, str]:
        # Import here to avoid circular imports at module load time
        from applicants.models import Applicant

        try:
            token_uuid = uuid.UUID(token_str)
        except ValueError:
            raise exceptions.AuthenticationFailed("Invalid applicant session token format.")

        try:
            applicant = Applicant.objects.get(session_token=token_uuid, is_active=True)
        except Applicant.DoesNotExist:
            raise exceptions.AuthenticationFailed("Invalid or expired applicant session token.")

        return ApplicantPrincipal(applicant), token_str

    def authenticate_header(self, request) -> str:
        return self.keyword

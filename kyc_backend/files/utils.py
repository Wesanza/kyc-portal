"""
Short-lived signed tokens for secure file access.

Token format: a URL-safe signed string encoding (file_path, applicant_id, expiry).
Uses Django's signing framework — no extra dependencies.
"""
from __future__ import annotations

import time

from django.core import signing
from django.conf import settings

SALT = "kyc-file-token-v1"


def generate_file_token(file_path: str, applicant_id: str) -> str:
    """
    Generate a short-lived signed token for secure file access.
    Token encodes file_path + applicant_id and expires after FILE_URL_EXPIRY_SECONDS.
    """
    expiry = int(time.time()) + getattr(settings, "FILE_URL_EXPIRY_SECONDS", 3600)
    payload = {"path": file_path, "aid": applicant_id, "exp": expiry}
    return signing.dumps(payload, salt=SALT)


def verify_file_token(token: str) -> dict | None:
    """
    Verify and decode a file token.
    Returns the payload dict if valid, or None if invalid/expired.
    """
    try:
        payload = signing.loads(token, salt=SALT)
    except signing.BadSignature:
        return None

    if int(time.time()) > payload.get("exp", 0):
        return None  # Expired

    return payload

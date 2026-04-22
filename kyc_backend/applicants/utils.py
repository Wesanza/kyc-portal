import uuid
from django.conf import settings
from django.utils import timezone


def generate_invite_link(invite_token: uuid.UUID) -> str:
    """Build the full frontend invite URL for a given token."""
    return f"{settings.FRONTEND_BASE_URL}/onboard/{invite_token}"


def invite_expired(applicant) -> bool:
    if applicant.invite_expires_at is None:
        return False
    return timezone.now() > applicant.invite_expires_at

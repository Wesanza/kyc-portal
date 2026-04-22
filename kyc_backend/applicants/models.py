import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from accounts.models import InviteSettings


class Applicant(models.Model):
    """
    Represents a job applicant invited to complete KYC.
    Authentication is token-based — no Django User password required.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True)

    # Created by HR/Admin staff
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_applicants",
    )

    # Invite management
    invite_token = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    invite_used = models.BooleanField(default=False)
    invite_sent_at = models.DateTimeField(null=True, blank=True)
    invite_expires_at = models.DateTimeField(null=True, blank=True)

    # Session token — issued when applicant first validates their invite
    session_token = models.UUIDField(null=True, blank=True, unique=True, db_index=True)

    # Soft-delete / active flag
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Applicant"
        verbose_name_plural = "Applicants"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} <{self.email}>"

    # ------------------------------------------------------------------
    # Invite helpers
    # ------------------------------------------------------------------

    def set_invite_expiry(self) -> None:
        """Set invite expiry based on settings.INVITE_EXPIRY_DAYS."""
        from datetime import timedelta
        days = InviteSettings.get_solo().expiry_days
        self.invite_expires_at = timezone.now() + timedelta(days=days)

    @property
    def invite_expired(self) -> bool:
        if self.invite_expires_at is None:
            return False
        return timezone.now() > self.invite_expires_at

    @property
    def invite_url(self) -> str:
        return f"{settings.FRONTEND_BASE_URL}/onboard/{self.invite_token}"

    def regenerate_invite(self) -> None:
        self.invite_token = uuid.uuid4()
        self.invite_used = False
        self.set_invite_expiry()

    def issue_session_token(self) -> uuid.UUID:
        """Create and save a fresh session token. Returns the token."""
        self.session_token = uuid.uuid4()
        self.invite_used = True
        self.save(update_fields=["session_token", "invite_used", "updated_at"])
        return self.session_token

    # ------------------------------------------------------------------
    # KYC status (computed — not stored directly)
    # ------------------------------------------------------------------

    @property
    def kyc_status(self) -> str:
        """Delegate to reviews aggregator to avoid circular imports."""
        from reviews.aggregator import compute_overall_kyc_status
        return compute_overall_kyc_status(self)

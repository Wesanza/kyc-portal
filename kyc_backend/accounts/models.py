from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for admin/HR staff.
    Applicants use a separate Applicant model.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        HR = "HR", "HR"

    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.HR)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    class Meta:
        verbose_name = "Staff User"
        verbose_name_plural = "Staff Users"

    def __str__(self) -> str:
        return f"{self.full_name} <{self.email}> [{self.role}]"

    @property
    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN

    @property
    def is_hr(self) -> bool:
        return self.role == self.Role.HR


class NotificationPreferences(models.Model):
    """Per-user email notification preferences for admin/HR staff."""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="notification_preferences",
    )
    on_submission = models.BooleanField(default=True)
    on_kyc_complete = models.BooleanField(default=True)
    on_revision = models.BooleanField(default=False)
    digest_email = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Notification Preferences"

    def __str__(self):
        return f"NotificationPrefs({self.user.email})"


class InviteSettings(models.Model):
    """
    System-wide invite configuration. Only one row ever exists (singleton).
    Access via InviteSettings.get_solo().
    """
    expiry_days = models.PositiveIntegerField(default=30)
    require_pin = models.BooleanField(default=False)
    portal_base_url = models.CharField(max_length=500, default="")

    class Meta:
        verbose_name = "Invite Settings"

    def __str__(self):
        return f"InviteSettings(expiry={self.expiry_days}d)"

    @classmethod
    def get_solo(cls) -> "InviteSettings":
        """Return the singleton row, creating it with defaults if missing."""
        from django.conf import settings as django_settings
        obj, created = cls.objects.get_or_create(pk=1)
        if created and not obj.portal_base_url:
            obj.portal_base_url = getattr(django_settings, "FRONTEND_BASE_URL", "")
            obj.save(update_fields=["portal_base_url"])
        return obj
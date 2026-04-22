import uuid
from django.db import models


class Notification(models.Model):
    """
    In-app notification for both admin staff and applicants.
    """

    class RecipientType(models.TextChoices):
        ADMIN = "ADMIN", "Admin/HR"
        APPLICANT = "APPLICANT", "Applicant"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_type = models.CharField(max_length=10, choices=RecipientType.choices, db_index=True)

    # Generic recipient ID — either a User pk (int) or Applicant pk (UUID str)
    recipient_id = models.CharField(max_length=50, db_index=True)

    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)

    # Optional metadata for linking from the notification
    applicant_id = models.CharField(max_length=50, blank=True, default="")
    section_name = models.CharField(max_length=30, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient_type", "recipient_id", "is_read"]),
        ]

    def __str__(self) -> str:
        read_flag = "✓" if self.is_read else "●"
        return f"[{read_flag}] {self.recipient_type}/{self.recipient_id}: {self.message[:60]}"

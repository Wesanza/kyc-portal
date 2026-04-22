from django.conf import settings
from django.db import models

from applicants.models import Applicant
from documents.constants import SECTION_STATUS_CHOICES, KYC_SECTIONS


class ReviewLog(models.Model):
    """
    Insert-only audit trail of every review action taken by a staff member.
    Never updated or deleted.
    """
    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE,
        related_name="review_logs",
    )
    section_name = models.CharField(
        max_length=30,
        choices=[(s, s) for s in KYC_SECTIONS],
        db_index=True,
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="review_actions",
    )
    old_status = models.CharField(max_length=25, choices=SECTION_STATUS_CHOICES)
    new_status = models.CharField(max_length=25, choices=SECTION_STATUS_CHOICES)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Review Log Entry"
        verbose_name_plural = "Review Log"
        ordering = ["-created_at"]
        # Prevent any update — enforced at DB level via a check constraint
        # (true immutability needs a DB trigger; this signals intent)

    def __str__(self) -> str:
        return (
            f"[{self.created_at:%Y-%m-%d %H:%M}] "
            f"{self.applicant} / {self.section_name}: "
            f"{self.old_status} → {self.new_status} by {self.reviewer}"
        )

    def save(self, *args, **kwargs):
        if self.pk:
            raise PermissionError("ReviewLog entries are immutable — they cannot be updated.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise PermissionError("ReviewLog entries are immutable — they cannot be deleted.")

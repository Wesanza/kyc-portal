"""
Celery async tasks for email and in-app notifications.
All tasks are designed to be idempotent and safe to retry.
"""
from __future__ import annotations

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_applicant(applicant_id: str):
    from applicants.models import Applicant
    try:
        return Applicant.objects.get(pk=applicant_id)
    except Applicant.DoesNotExist:
        logger.warning("Notification task: Applicant %s not found", applicant_id)
        return None


def _send_email(to: str, subject: str, template_name: str, context: dict) -> None:
    """Render and send an HTML email with a plain-text fallback."""
    if not getattr(settings, "NOTIFICATIONS_ENABLED", True):
        return

    html_body = render_to_string(f"email/{template_name}.html", context)
    text_body = render_to_string(f"email/{template_name}.txt", context)

    msg = EmailMultiAlternatives(
        subject=f"{settings.EMAIL_SUBJECT_PREFIX}{subject}",
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to],
    )
    msg.attach_alternative(html_body, "text/html")
    try:
        msg.send()
    except Exception as exc:  # pragma: no cover
        logger.error("Email send failed to %s: %s", to, exc)


def _create_notification(
    recipient_type: str,
    recipient_id: str,
    message: str,
    applicant_id: str = "",
    section_name: str = "",
) -> None:
    from .models import Notification
    Notification.objects.create(
        recipient_type=recipient_type,
        recipient_id=str(recipient_id),
        message=message,
        applicant_id=applicant_id,
        section_name=section_name,
    )


# ---------------------------------------------------------------------------
# Task: send invite email
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_invite_email(self, applicant_id: str) -> None:
    applicant = _get_applicant(applicant_id)
    if not applicant:
        return

    context = {
        "full_name": applicant.full_name,
        "invite_url": applicant.invite_url,
        "expiry_days": settings.INVITE_EXPIRY_DAYS,
        "support_email": settings.DEFAULT_FROM_EMAIL,
    }
    try:
        _send_email(
            to=applicant.email,
            subject="Your KYC Onboarding Invitation",
            template_name="invite",
            context=context,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Task: notify admin that a section was submitted
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def notify_admin_section_submitted(self, applicant_id: str, section_name: str) -> None:
    applicant = _get_applicant(applicant_id)
    if not applicant:
        return

    from documents.constants import KYC_SECTION_LABELS
    label = KYC_SECTION_LABELS.get(section_name, section_name)
    message = f"{applicant.full_name} has submitted the '{label}' section for review."

    # In-app notification for all active HR/Admin users
    from accounts.models import User
    admins = User.objects.filter(is_active=True, role__in=["ADMIN", "HR"])
    for admin_user in admins:
        _create_notification(
            recipient_type="ADMIN",
            recipient_id=str(admin_user.pk),
            message=message,
            applicant_id=applicant_id,
            section_name=section_name,
        )


# ---------------------------------------------------------------------------
# Task: notify applicant their section was reviewed
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_applicant_section_reviewed(
    self, applicant_id: str, section_name: str, new_status: str, notes: str
) -> None:
    applicant = _get_applicant(applicant_id)
    if not applicant:
        return

    from documents.constants import KYC_SECTION_LABELS
    label = KYC_SECTION_LABELS.get(section_name, section_name)

    status_messages = {
        "APPROVED": f"Your '{label}' section has been approved. ✓",
        "REJECTED": f"Your '{label}' section was rejected. Please review the feedback.",
        "REVISION_REQUESTED": f"Revisions are requested for your '{label}' section.",
        "IN_REVIEW": f"Your '{label}' section is now under review.",
    }
    message = status_messages.get(new_status, f"Your '{label}' section status changed to {new_status}.")

    _create_notification(
        recipient_type="APPLICANT",
        recipient_id=str(applicant.pk),
        message=message,
        applicant_id=applicant_id,
        section_name=section_name,
    )

    if new_status in ("APPROVED", "REJECTED", "REVISION_REQUESTED"):
        context = {
            "full_name": applicant.full_name,
            "section_label": label,
            "new_status": new_status,
            "reviewer_notes": notes,
            "portal_url": f"{settings.FRONTEND_BASE_URL}/portal/kyc/{section_name.replace('_', '-')}",
        }
        try:
            _send_email(
                to=applicant.email,
                subject=f"KYC Update: {label}",
                template_name="section_review",
                context=context,
            )
        except Exception as exc:
            raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Task: notify on full KYC approval
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_kyc_complete(self, applicant_id: str) -> None:
    applicant = _get_applicant(applicant_id)
    if not applicant:
        return

    # Applicant email
    context = {
        "full_name": applicant.full_name,
        "portal_url": f"{settings.FRONTEND_BASE_URL}/portal/status",
    }
    try:
        _send_email(
            to=applicant.email,
            subject="Your KYC Submission is Complete!",
            template_name="kyc_complete",
            context=context,
        )
    except Exception as exc:
        raise self.retry(exc=exc)

    # In-app: notify admins too
    from accounts.models import User
    admins = User.objects.filter(is_active=True, role__in=["ADMIN", "HR"])
    for admin_user in admins:
        _create_notification(
            recipient_type="ADMIN",
            recipient_id=str(admin_user.pk),
            message=f"{applicant.full_name} has completed all KYC sections. Ready for final sign-off.",
            applicant_id=applicant_id,
        )

    # In-app: applicant
    _create_notification(
        recipient_type="APPLICANT",
        recipient_id=str(applicant.pk),
        message="🎉 All KYC sections have been approved. Your onboarding is complete!",
        applicant_id=applicant_id,
    )

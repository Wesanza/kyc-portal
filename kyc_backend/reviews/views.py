"""
Admin-facing review views.

Routes (all under /api/admin/kyc/<applicant_id>/):
    GET  sections/                  — list all sections with data + status
    PATCH <section>/review/         — update section status + notes
    GET  review-log/                — chronological audit trail
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrHR
from applicants.models import Applicant
from documents.constants import KYC_SECTIONS
from .aggregator import build_kyc_summary, _get_section_model
from .models import ReviewLog
from .serializers import ReviewActionSerializer, ReviewLogSerializer
from .aggregator import build_kyc_summary, _get_section_model, _get_section_instance


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

VALID_TRANSITIONS: dict[str, list[str]] = {
    "NOT_STARTED": [],
    "PENDING": ["IN_REVIEW"],
    "IN_REVIEW": ["APPROVED", "REJECTED", "REVISION_REQUESTED"],
    "REVISION_REQUESTED": ["IN_REVIEW"],
    "REJECTED": ["IN_REVIEW"],
    "APPROVED": ["IN_REVIEW"],  # allow re-opening
}


# def _get_section_instance(applicant: Applicant, section: str):
#     """Return the section model instance or None if not yet submitted."""
#     model = _get_section_model(section)
#     if section == "payslips":
#         return list(model.objects.filter(applicant=applicant))
#     try:
#         return model.objects.get(applicant=applicant)
#     except model.DoesNotExist:
#         return None


def _apply_payslip_review(applicant, new_status, notes, reviewer) -> None:
    """Apply a review status to all payslips for the applicant."""
    from documents.models import Payslip
    payslips = Payslip.objects.filter(applicant=applicant)
    if not payslips.exists():
        return
    old_status = payslips.first().status
    payslips.update(status=new_status, reviewer_notes=notes)
    ReviewLog.objects.create(
        applicant=applicant,
        section_name="payslips",
        reviewer=reviewer,
        old_status=old_status,
        new_status=new_status,
        notes=notes,
    )


# ---------------------------------------------------------------------------
# Section list view
# ---------------------------------------------------------------------------
class KYCSectionsListView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request, applicant_id):
        applicant = get_object_or_404(Applicant, pk=applicant_id, is_active=True)
        summary = build_kyc_summary(applicant)

        from .aggregator import _get_section_instance_data
        for section in summary["sections"]:
            # Pass request so FileField URLs become absolute
            section["data"] = _get_section_instance_data(
                applicant, section["section"], request=request   # 👈
            )
        return Response(summary)


# ---------------------------------------------------------------------------
# Per-section review action
# ---------------------------------------------------------------------------

class SectionReviewView(APIView):
    """
    PATCH /api/admin/kyc/<applicant_id>/<section>/review/
    """
    permission_classes = [IsAdminOrHR]

    def patch(self, request, applicant_id, section):
        if section not in KYC_SECTIONS:
            return Response(
                {"detail": f"Unknown section '{section}'. Valid: {KYC_SECTIONS}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        applicant = get_object_or_404(Applicant, pk=applicant_id, is_active=True)

        serializer = ReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        notes = serializer.validated_data.get("reviewer_notes", "")

        # ── Payslips (FK — multiple rows) ──────────────────────────────
        if section == "payslips":
            from documents.models import Payslip
            payslips = list(Payslip.objects.filter(applicant=applicant))
            if not payslips:
                return Response(
                    {"detail": "No payslips have been submitted yet."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            old_status = payslips[0].status
            _apply_payslip_review(applicant, new_status, notes, request.user)
            self._trigger_notification(applicant, section, new_status, notes)
            return Response({
                "section": section,
                "old_status": old_status,
                "new_status": new_status,
                "message": "Payslip review recorded.",
            })

        # ── OneToOne sections ──────────────────────────────────────────
        model = _get_section_model(section)
        try:
            instance = model.objects.get(applicant=applicant)
        except model.DoesNotExist:
            return Response(
                {"detail": "This section has not been submitted by the applicant yet."},
                status=status.HTTP_404_NOT_FOUND,
            )

        old_status = instance.status

        # Validate transition
        allowed = VALID_TRANSITIONS.get(old_status, [])
        if new_status not in allowed:
            return Response(
                {
                    "detail": f"Cannot transition '{old_status}' → '{new_status}'.",
                    "allowed_transitions": allowed,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # Apply
        instance.status = new_status
        instance.reviewer_notes = notes
        instance.save(update_fields=["status", "reviewer_notes", "updated_at"])

        # Audit log
        ReviewLog.objects.create(
            applicant=applicant,
            section_name=section,
            reviewer=request.user,
            old_status=old_status,
            new_status=new_status,
            notes=notes,
        )

        self._trigger_notification(applicant, section, new_status, notes)

        # Check if all sections are now approved → KYC complete notification
        from .aggregator import compute_overall_kyc_status
        if compute_overall_kyc_status(applicant) == "APPROVED":
            from notifications.tasks import notify_kyc_complete
            notify_kyc_complete.delay(str(applicant.pk))

        return Response({
            "section": section,
            "old_status": old_status,
            "new_status": new_status,
            "message": f"Section '{section}' status updated to {new_status}.",
        })

    @staticmethod
    def _trigger_notification(applicant, section, new_status, notes):
        from notifications.tasks import notify_applicant_section_reviewed
        notify_applicant_section_reviewed.delay(
            str(applicant.pk), section, new_status, notes
        )


# ---------------------------------------------------------------------------
# Review log
# ---------------------------------------------------------------------------

class ReviewLogView(APIView):
    """
    GET /api/admin/kyc/<applicant_id>/review-log/
    """
    permission_classes = [IsAdminOrHR]

    def get(self, request, applicant_id):
        applicant = get_object_or_404(Applicant, pk=applicant_id, is_active=True)
        logs = (
            ReviewLog.objects
            .filter(applicant=applicant)
            .select_related("reviewer")
            .order_by("-created_at")
        )
        serializer = ReviewLogSerializer(logs, many=True)
        return Response({"results": serializer.data, "count": logs.count()})

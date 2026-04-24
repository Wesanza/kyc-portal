from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsAdminOnly, IsAdminOrHR
from .models import Applicant
from .serializers import (
    ApplicantCreateSerializer,
    ApplicantSerializer,
    KYCSummarySerializer,
)
from .utils import invite_expired


# ---------------------------------------------------------------------------
# Admin-facing: Applicant CRUD
# ---------------------------------------------------------------------------

class ApplicantViewSet(ModelViewSet):
    """
    CRUD for applicants — admin/HR only.
    """
    permission_classes = [IsAdminOrHR]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active"]
    search_fields = ["full_name", "email", "phone"]
    ordering_fields = ["created_at", "full_name", "email"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Applicant.objects.select_related("created_by").filter(is_active=True)
        kyc_status = self.request.query_params.get("kyc_status")
        if kyc_status:
            # Filter by computed status — done in Python after DB fetch (small datasets)
            qs = [a for a in qs if a.kyc_status == kyc_status]
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicantCreateSerializer
        return ApplicantSerializer

    def perform_create(self, serializer):
        applicant = serializer.save()
        # Fire invite email async
        from notifications.tasks import send_invite_email
        send_invite_email(str(applicant.pk))

    def perform_destroy(self, instance):
        """Soft-delete only."""
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

    @action(detail=True, methods=["post"], url_path="resend-invite")
    def resend_invite(self, request: Request, pk=None) -> Response:
        applicant = self.get_object()
        if not invite_expired(applicant) and applicant.invite_used:
            return Response(
                {"detail": "Applicant has already completed KYC."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from notifications.tasks import send_invite_email
        send_invite_email(str(applicant.pk))
        return Response({"detail": "Invite email queued for delivery."})

    @action(detail=True, methods=["post"], url_path="regenerate-invite")
    def regenerate_invite(self, request: Request, pk=None) -> Response:
        applicant = self.get_object()
        applicant.regenerate_invite()
        applicant.save(update_fields=["invite_token", "invite_used", "invite_expires_at", "updated_at"])
        from notifications.tasks import send_invite_email
        send_invite_email(str(applicant.pk))
        return Response(
            {"detail": "Invite regenerated.", "invite_url": applicant.invite_url},
        )

    @action(detail=True, methods=["get"], url_path="kyc-summary")
    def kyc_summary(self, request: Request, pk=None) -> Response:
        applicant = self.get_object()
        from reviews.aggregator import build_kyc_summary
        summary = build_kyc_summary(applicant)
        serializer = KYCSummarySerializer(summary)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Applicant-facing: invite validation + session
# ---------------------------------------------------------------------------

class InviteValidateView(APIView):
    """
    GET /api/applicant/invite/<token>/validate/
    Validates the invite token and issues a session token.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    def get(self, request: Request, token: str) -> Response:
        try:
            applicant = Applicant.objects.get(invite_token=token, is_active=True)
        except Applicant.DoesNotExist:
            return Response(
                {"detail": "This invite link is invalid."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if invite_expired(applicant):
            return Response(
                {"detail": "This invite link has expired. Please contact HR.", "code": "EXPIRED"},
                status=status.HTTP_410_GONE,
            )

        if applicant.invite_used and applicant.session_token:
            # Already onboarded — re-issue session token so they can log back in
            return Response({
                "applicant_id": str(applicant.pk),
                "full_name": applicant.full_name,
                "email": applicant.email,
                "session_token": str(applicant.session_token),
                "message": "Welcome back! You have already completed this step.",
            })

        session_token = applicant.issue_session_token()

        return Response({
            "applicant_id": str(applicant.pk),
            "full_name": applicant.full_name,
            "email": applicant.email,
            "session_token": str(session_token),
            "message": "Invite validated. Please proceed to complete your KYC.",
        })

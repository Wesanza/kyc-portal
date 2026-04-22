"""
Shared base mixin for all KYC section submission views.

Each section follows the same pattern:
  - GET  → return existing submission (or 404)
  - POST → create (first submission)
  - PUT  → full replace
  - PATCH → partial update

On any write the section status resets to PENDING.
"""
from rest_framework import status
from rest_framework.response import Response

from accounts.permissions import IsApplicantOwner
from documents.constants import DEFAULT_STATUS


class KYCSectionMixin:
    """
    Must be mixed into an APIView subclass.
    Subclasses define:
        model        — the Django model class
        serializer_class — the DRF serializer
        section_name — str identifier (matches KYC_SECTIONS constant)
    """
    permission_classes = [IsApplicantOwner]
    model = None
    serializer_class = None
    section_name: str = ""

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _get_applicant(self):
        """Return the Applicant instance for the authenticated session."""
        from applicants.models import Applicant
        return Applicant.objects.get(pk=self.request.user.applicant_id)

    def _get_instance(self, applicant):
        try:
            return self.model.objects.get(applicant=applicant)
        except self.model.DoesNotExist:
            return None

    def _build_response(self, instance, request, created: bool = False):
        serializer = self.serializer_class(instance, context={"request": request})
        http_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(
            {
                "section": self.section_name,
                "status": instance.status,
                "data": serializer.data,
                "message": "Submission received. Your data is under review." if created
                           else "Submission updated.",
            },
            status=http_status,
        )

    # ------------------------------------------------------------------
    # GET
    # ------------------------------------------------------------------

    def get(self, request, *args, **kwargs):
        applicant = self._get_applicant()
        instance = self._get_instance(applicant)
        if instance is None:
            return Response(
                {"section": self.section_name, "status": "NOT_STARTED", "data": None},
                status=status.HTTP_200_OK,
            )
        return self._build_response(instance, request)

    # ------------------------------------------------------------------
    # POST (create)
    # ------------------------------------------------------------------

    def post(self, request, *args, **kwargs):
        applicant = self._get_applicant()
        if self._get_instance(applicant) is not None:
            return Response(
                {"detail": "Submission already exists. Use PUT or PATCH to update."},
                status=status.HTTP_409_CONFLICT,
            )
        return self._write(request, applicant, created=True)

    # ------------------------------------------------------------------
    # PUT (full replace)
    # ------------------------------------------------------------------

    def put(self, request, *args, **kwargs):
        applicant = self._get_applicant()
        instance = self._get_instance(applicant)
        if instance is None:
            return self._write(request, applicant, created=True)
        return self._write(request, applicant, instance=instance, partial=False)

    # ------------------------------------------------------------------
    # PATCH (partial update)
    # ------------------------------------------------------------------

    def patch(self, request, *args, **kwargs):
        applicant = self._get_applicant()
        instance = self._get_instance(applicant)
        if instance is None:
            return Response(
                {"detail": "No existing submission found. Use POST or PUT first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return self._write(request, applicant, instance=instance, partial=True)

    # ------------------------------------------------------------------
    # Internal write helper
    # ------------------------------------------------------------------

    def _write(self, request, applicant, instance=None, partial=False, created=False):
        serializer = self.serializer_class(
            instance,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        # Reset to PENDING on any resubmission
        obj = serializer.save(applicant=applicant, status=DEFAULT_STATUS)

        # Trigger admin notification
        from notifications.tasks import notify_admin_section_submitted
        notify_admin_section_submitted.delay(str(applicant.pk), self.section_name)

        return self._build_response(obj, request, created=created or instance is None)

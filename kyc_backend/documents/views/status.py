from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsApplicantOwner
from documents.constants import KYC_SECTIONS, KYC_SECTION_LABELS


class KYCStatusView(APIView):
    """
    GET /api/applicant/kyc/status/
    Returns per-section status for the authenticated applicant.
    """
    permission_classes = [IsApplicantOwner]

    def get(self, request):
        from applicants.models import Applicant
        from reviews.aggregator import build_kyc_summary

        applicant = Applicant.objects.get(pk=request.user.applicant_id)
        summary = build_kyc_summary(applicant)
        return Response(summary)

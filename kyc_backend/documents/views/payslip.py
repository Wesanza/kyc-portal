from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsApplicantOwner
from documents.constants import DEFAULT_STATUS, MAX_PAYSLIPS
from documents.models import Payslip
from documents.serializers import PayslipSerializer


class PayslipsView(APIView):
    """
    Payslips differ from other sections: up to 3 payslips per applicant (FK not OneToOne).
    GET  — list all payslips for the applicant
    POST — batch create / replace payslips (clears existing, inserts new)
    """
    permission_classes = [IsApplicantOwner]

    def _get_applicant(self):
        from applicants.models import Applicant
        return Applicant.objects.get(pk=self.request.user.applicant_id)

    def get(self, request):
        applicant = self._get_applicant()
        payslips = Payslip.objects.filter(applicant=applicant)
        serializer = PayslipSerializer(payslips, many=True, context={"request": request})
        return Response({
            "section": "payslips",
            "status": self._aggregate_status(payslips),
            "data": serializer.data,
        })

    def post(self, request):
        return self._handle_write(request)

    def put(self, request):
        return self._handle_write(request)

    def _handle_write(self, request):
        print("FILES keys:", list(request.FILES.keys()))
        print("DATA keys:", list(request.data.keys()))    
        applicant = self._get_applicant()

        payslips_data = []
        i = 0
        while True:
            file = request.FILES.get(f'payslips[{i}][file]')
            month_label = request.data.get(f'payslips[{i}][month_label]')
            # Break if neither key exists for this index
            if file is None and month_label is None:
                break
            payslips_data.append({
                'file': file,
                'month_label': month_label or '',
                'is_certified': request.data.get(f'payslips[{i}][is_certified]', 'false').lower() == 'true',
            })
            i += 1

        # JSON fallback (non-multipart)
        if not payslips_data:
            raw = request.data if isinstance(request.data, list) else request.data.get("payslips", [])
            payslips_data = raw

        if not payslips_data:
            return Response(
                {"detail": "Provide a list of payslip objects."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(payslips_data) > MAX_PAYSLIPS:
            return Response(
                {"detail": f"A maximum of {MAX_PAYSLIPS} payslips can be submitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializers_list = []
        for item in payslips_data:
            s = PayslipSerializer(data=item, context={"request": request})
            s.is_valid(raise_exception=True)
            serializers_list.append(s)

        from django.db import transaction
        with transaction.atomic():
            Payslip.objects.filter(applicant=applicant).delete()
            created = [s.save(applicant=applicant, status=DEFAULT_STATUS) for s in serializers_list]

        from notifications.tasks import notify_admin_section_submitted
        notify_admin_section_submitted.delay(str(applicant.pk), "payslips")

        out = PayslipSerializer(created, many=True, context={"request": request})
        return Response({
            "section": "payslips",
            "status": DEFAULT_STATUS,
            "data": out.data,
            "message": f"{len(created)} payslip(s) submitted successfully.",
        }, status=status.HTTP_201_CREATED)

    @staticmethod
    def _aggregate_status(payslips) -> str:
        statuses = [p.status for p in payslips]
        if not statuses:
            return "NOT_STARTED"
        if all(s == "APPROVED" for s in statuses):
            return "APPROVED"
        if any(s == "REJECTED" for s in statuses):
            return "REJECTED"
        if any(s == "REVISION_REQUESTED" for s in statuses):
            return "REVISION_REQUESTED"
        if any(s == "IN_REVIEW" for s in statuses):
            return "IN_REVIEW"
        return "PENDING"

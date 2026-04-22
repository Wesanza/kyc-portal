from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsApplicantOwner
from documents.constants import DEFAULT_STATUS
from documents.models import NextOfKin
from documents.serializers import NextOfKinSerializer


class NextOfKinView(APIView):
    permission_classes = [IsApplicantOwner]

    def _get_applicant(self):
        from applicants.models import Applicant
        return Applicant.objects.get(pk=self.request.user.applicant_id)

    def get(self, request):
        applicant = self._get_applicant()
        try:
            instance = NextOfKin.objects.get(applicant=applicant)
            serializer = NextOfKinSerializer(instance, context={"request": request})
            return Response({
                "section": "next_of_kin",
                "status": instance.status,
                "data": serializer.data,
            })
        except NextOfKin.DoesNotExist:
            return Response({
                "section": "next_of_kin",
                "status": "NOT_STARTED",
                "data": None,
            })

    def post(self, request):
        return self._handle_write(request)

    def put(self, request):
        return self._handle_write(request)

    def _handle_write(self, request):
        applicant = self._get_applicant()
        data = request.data.copy()

        # Normalise relationship value to uppercase to match TextChoices
        raw_relationship = data.get("relationship", "")
        normalised = raw_relationship.upper()

        VALID_CHOICES = {"SPOUSE", "PARENT", "SIBLING", "CHILD", "OTHER"}

        if normalised in VALID_CHOICES:
            data["relationship"] = normalised
        else:
            # Treat unknown value as OTHER with relationship_other set
            data["relationship"] = "OTHER"
            data["relationship_other"] = raw_relationship

        # Frontend merges custom relationship into the relationship field —
        # if it came in as OTHER with a custom value via finalRelationship,
        # split it back out
        if normalised == "OTHER":
            # relationship_other may already be in data if frontend sends it,
            # otherwise it was merged into relationship field — nothing to do
            # since the frontend sends relationship=customValue when Other is picked
            if not data.get("relationship_other"):
                # raw value was the custom string, not "Other"
                data["relationship_other"] = raw_relationship
                data["relationship"] = "OTHER"

        try:
            instance = NextOfKin.objects.get(applicant=applicant)
            serializer = NextOfKinSerializer(
                instance, data=data, partial=True, context={"request": request}
            )
        except NextOfKin.DoesNotExist:
            serializer = NextOfKinSerializer(data=data, context={"request": request})

        serializer.is_valid(raise_exception=True)
        instance = serializer.save(applicant=applicant, status=DEFAULT_STATUS)

        from notifications.tasks import notify_admin_section_submitted
        notify_admin_section_submitted.delay(str(applicant.pk), "next_of_kin")

        return Response({
            "section": "next_of_kin",
            "status": DEFAULT_STATUS,
            "data": NextOfKinSerializer(instance, context={"request": request}).data,
            "message": "Next of kin details submitted successfully.",
        }, status=status.HTTP_201_CREATED)
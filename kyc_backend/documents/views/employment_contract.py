from rest_framework.views import APIView
from documents.models import EmploymentContract
from documents.serializers import EmploymentContractSerializer
from .base import KYCSectionMixin


class EmploymentContractView(KYCSectionMixin, APIView):
    model = EmploymentContract
    serializer_class = EmploymentContractSerializer
    section_name = "employment_contract"

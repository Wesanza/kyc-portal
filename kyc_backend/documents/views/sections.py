from rest_framework.views import APIView

from documents.models import (
    IdentityDocument,
    HomeAddress,
    OfficeAddress,
    SocialMedia,
    ContactDetails,
    NextOfKin,
)
from documents.serializers import (
    IdentityDocumentSerializer,
    HomeAddressSerializer,
    OfficeAddressSerializer,
    SocialMediaSerializer,
    ContactDetailsSerializer,
    NextOfKinSerializer,
)
from .base import KYCSectionMixin


class IdentityView(KYCSectionMixin, APIView):
    model = IdentityDocument
    serializer_class = IdentityDocumentSerializer
    section_name = "identity"


class HomeAddressView(KYCSectionMixin, APIView):
    model = HomeAddress
    serializer_class = HomeAddressSerializer
    section_name = "home_address"


class OfficeAddressView(KYCSectionMixin, APIView):
    model = OfficeAddress
    serializer_class = OfficeAddressSerializer
    section_name = "office_address"


class SocialMediaView(KYCSectionMixin, APIView):
    model = SocialMedia
    serializer_class = SocialMediaSerializer
    section_name = "social_media"


class ContactDetailsView(KYCSectionMixin, APIView):
    model = ContactDetails
    serializer_class = ContactDetailsSerializer
    section_name = "contact_details"


# class NextOfKinView(KYCSectionMixin, APIView):
#     model = NextOfKin
#     serializer_class = NextOfKinSerializer
#     section_name = "next_of_kin"

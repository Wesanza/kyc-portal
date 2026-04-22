from rest_framework import serializers
from documents.models import HomeAddress, OfficeAddress


class AddressBaseSerializer(serializers.ModelSerializer):
    class Meta:
        fields = [
            "id", "applicant",
            "address_text", "google_maps_pin_url",
            "latitude", "longitude",
            "status", "reviewer_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "applicant", "latitude", "longitude", "status", "reviewer_notes", "created_at", "updated_at"]


class HomeAddressSerializer(AddressBaseSerializer):
    class Meta(AddressBaseSerializer.Meta):
        model = HomeAddress


class OfficeAddressSerializer(AddressBaseSerializer):
    class Meta(AddressBaseSerializer.Meta):
        model = OfficeAddress

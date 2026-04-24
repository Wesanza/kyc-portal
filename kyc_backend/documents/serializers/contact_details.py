from rest_framework import serializers
from documents.models import ContactDetails


class ContactDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactDetails
        fields = [
            "id", "applicant",
            "phone_primary", "phone_secondary",
            "status", "reviewer_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "applicant", "status", "reviewer_notes", "created_at", "updated_at"]



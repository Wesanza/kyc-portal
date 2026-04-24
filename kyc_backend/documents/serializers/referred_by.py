from rest_framework import serializers
from documents.models import ReferredBy


class ReferredBySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferredBy
        fields = [
            "id",
            "referrer_name",
            "referrer_relationship",
            "referrer_phone",
            "referrer_email",
            "notes",
            "status",
            "reviewer_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "reviewer_notes", "created_at", "updated_at"]
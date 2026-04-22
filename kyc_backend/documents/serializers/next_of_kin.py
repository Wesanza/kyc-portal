from rest_framework import serializers
from documents.models import NextOfKin

class NextOfKinSerializer(serializers.ModelSerializer):
    class Meta:
        model = NextOfKin
        fields = [
            "id",
            "full_name", "relationship", "relationship_other",
            "phone_primary", "phone_secondary",
            "status", "reviewer_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "status", "reviewer_notes", "created_at", "updated_at"
        ]

    def validate(self, attrs):
        if attrs.get("relationship") == "OTHER" and not attrs.get("relationship_other"):
            raise serializers.ValidationError(
                {"relationship_other": "Please specify the relationship."}
            )
        return attrs
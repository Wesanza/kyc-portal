from rest_framework import serializers
from documents.models import SocialMedia


class SocialMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMedia
        fields = [
            "id", "applicant",
            "facebook_url", "instagram_url",
            "status", "reviewer_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "applicant", "status", "reviewer_notes", "created_at", "updated_at"]

    def validate(self, attrs):
        if not attrs.get("facebook_url") and not attrs.get("instagram_url"):
            raise serializers.ValidationError(
                "At least one social media URL (Facebook or Instagram) is required."
            )
        return attrs

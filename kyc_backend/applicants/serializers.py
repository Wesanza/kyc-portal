from django.utils import timezone
from rest_framework import serializers

from .models import Applicant
from .utils import generate_invite_link


class ApplicantSerializer(serializers.ModelSerializer):
    invite_url = serializers.SerializerMethodField()
    invite_status = serializers.SerializerMethodField()
    kyc_status = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Applicant
        fields = [
            "id", "full_name", "email", "phone",
            "created_by", "created_by_name",
            "invite_url", "invite_status", "invite_sent_at", "invite_expires_at",
            "invite_used", "kyc_status",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "created_by", "invite_url", "invite_status",
            "kyc_status", "created_at", "updated_at",
        ]

    def get_invite_url(self, obj: Applicant) -> str:
        return generate_invite_link(obj.invite_token)

    def get_invite_status(self, obj: Applicant) -> str:
        if obj.invite_used:
            return "USED"
        if obj.invite_expired:
            return "EXPIRED"
        return "ACTIVE"

    def get_kyc_status(self, obj: Applicant) -> str:
        return obj.kyc_status

    def get_created_by_name(self, obj: Applicant) -> str | None:
        if obj.created_by:
            return obj.created_by.full_name
        return None


class ApplicantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = ["full_name", "email", "phone"]

    def create(self, validated_data):
        request = self.context.get("request")
        applicant = Applicant(**validated_data)
        applicant.created_by = request.user if request else None
        applicant.set_invite_expiry()
        applicant.save()
        return applicant

    def to_representation(self, instance):
        # Return full shape (including invite_url) after create
        return ApplicantSerializer(instance, context=self.context).data


class InviteValidateSerializer(serializers.Serializer):
    """Response shape for invite validation."""
    applicant_id = serializers.UUIDField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    session_token = serializers.UUIDField()
    message = serializers.CharField()


class KYCSectionSummarySerializer(serializers.Serializer):
    section = serializers.CharField()
    status = serializers.CharField()
    submitted_at = serializers.DateTimeField(allow_null=True)
    reviewer_notes = serializers.CharField(allow_null=True, allow_blank=True)


class KYCSummarySerializer(serializers.Serializer):
    overall_status = serializers.CharField()
    completion_percentage = serializers.IntegerField()
    sections = KYCSectionSummarySerializer(many=True)
    last_activity = serializers.DateTimeField(allow_null=True)

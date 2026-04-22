from rest_framework import serializers
from django.conf import settings

from .models import ReviewLog
from documents.constants import SECTION_STATUS_CHOICES


REVIEW_TARGET_STATUSES = ["IN_REVIEW", "APPROVED", "REJECTED", "REVISION_REQUESTED"]


class ReviewActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=REVIEW_TARGET_STATUSES)
    reviewer_notes = serializers.CharField(allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["status"] in ("REJECTED", "REVISION_REQUESTED") and not attrs.get("reviewer_notes", "").strip():
            raise serializers.ValidationError(
                {"reviewer_notes": "Notes are required when rejecting or requesting a revision."}
            )
        return attrs


# ---------------------------------------------------------------------------
# Mixin: resolve every FileField / ImageField to an absolute URL
# ---------------------------------------------------------------------------

class AbsoluteMediaUrlMixin:
    """
    Override to_representation so that any FileField / ImageField value
    is returned as a full absolute URL instead of a bare relative path.

    Requires the serializer to receive `request` in its context:
        MySerializer(instance, context={"request": request})
    """

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")

        for field_name, field in self.fields.items():
            if not isinstance(field, (serializers.FileField, serializers.ImageField)):
                continue

            value = rep.get(field_name)
            if not value:
                continue

            # Already absolute (e.g. S3 / CDN URLs)
            if value.startswith(("http://", "https://")):
                continue

            if request is not None:
                rep[field_name] = request.build_absolute_uri(value)
            else:
                # Fallback: prepend MEDIA_URL / SITE_URL if no request in context
                site_url = getattr(settings, "SITE_URL", "").rstrip("/")
                rep[field_name] = f"{site_url}{value}"

        return rep


class ReviewLogSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    reviewer_email = serializers.SerializerMethodField()

    class Meta:
        model = ReviewLog
        fields = [
            "id", "applicant", "section_name",
            "reviewer", "reviewer_name", "reviewer_email",
            "old_status", "new_status", "notes", "created_at",
        ]
        read_only_fields = fields

    def get_reviewer_name(self, obj) -> str | None:
        return obj.reviewer.full_name if obj.reviewer else None

    def get_reviewer_email(self, obj) -> str | None:
        return obj.reviewer.email if obj.reviewer else None
    


def get_section_serializer(section: str):
    """
    Return the serializer class for a given KYC section name.
    Imported lazily to avoid circular imports.
    """
    from documents.serializers.address import HomeAddressSerializer, OfficeAddressSerializer
    from documents.serializers.contact_details import ContactDetailsSerializer
    from documents.serializers.identity import IdentityDocumentSerializer
    from documents.serializers.employment_contract import EmploymentContractSerializer
    from documents.serializers.next_of_kin import NextOfKinSerializer
    from documents.serializers.payslip import PayslipSerializer
    from documents.serializers.social_media import SocialMediaSerializer

    mapping = {
        "home_address": HomeAddressSerializer,
        "office_address": OfficeAddressSerializer,
        "contact_details": ContactDetailsSerializer,
        "identity": IdentityDocumentSerializer,
        "employment_contract": EmploymentContractSerializer,
        "next_of_kin": NextOfKinSerializer,
        "payslips": PayslipSerializer,
        "social_media": SocialMediaSerializer,
    }
    return mapping.get(section)
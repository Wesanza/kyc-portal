from rest_framework import serializers
from documents.models import Payslip
from documents.constants import MAX_PAYSLIPS

class PayslipSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Payslip
        fields = [
            "id", "file", "file_url",
            "month_label", "is_certified",
            "status", "reviewer_notes",
            "uploaded_at", "updated_at",
        ]
        read_only_fields = [
            "id", "status", "reviewer_notes", "uploaded_at", "updated_at"
        ]
        # applicant removed from fields entirely — set via save(applicant=applicant)

    def get_file_url(self, obj) -> str | None:
        from files.utils import generate_file_token
        if obj.file:
            token = generate_file_token(str(obj.file.name), str(obj.applicant_id))
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(f"/api/files/{token}/")
        return None


class PayslipBulkSerializer(serializers.Serializer):
    """
    Accepts a list of payslip entries for batch create/update.
    """
    payslips = serializers.ListField(child=PayslipSerializer(), max_length=MAX_PAYSLIPS)

    def validate_payslips(self, value):
        if len(value) < 1:
            raise serializers.ValidationError("At least one payslip is required.")
        return value

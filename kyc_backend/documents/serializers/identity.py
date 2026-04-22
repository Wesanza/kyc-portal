from rest_framework import serializers
from documents.models import IdentityDocument


class IdentityDocumentSerializer(serializers.ModelSerializer):
    kra_pin_file_url = serializers.SerializerMethodField()
    national_id_file_url = serializers.SerializerMethodField()

    class Meta:
        model = IdentityDocument
        fields = [
            "id", "applicant",
            "kra_pin_file", "kra_pin_file_url",
            "national_id_file", "national_id_file_url",
            "kra_pin_number", "id_number",
            "status", "reviewer_notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "applicant", "status", "reviewer_notes", "created_at", "updated_at"]

    def _file_url(self, file_field, applicant_id) -> str | None:
        from files.utils import generate_file_token
        if file_field:
            token = generate_file_token(str(file_field.name), str(applicant_id))
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(f"/api/files/{token}/")
        return None

    def get_kra_pin_file_url(self, obj) -> str | None:
        return self._file_url(obj.kra_pin_file, obj.applicant_id)

    def get_national_id_file_url(self, obj) -> str | None:
        return self._file_url(obj.national_id_file, obj.applicant_id)

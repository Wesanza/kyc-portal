from rest_framework import serializers
from documents.models import EmploymentContract


class EmploymentContractSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = EmploymentContract
        fields = ["id", "applicant", "file", "file_url", "status", "reviewer_notes", "created_at", "updated_at"]
        read_only_fields = ["id", "applicant", "status", "reviewer_notes", "created_at", "updated_at"]

    def get_file_url(self, obj) -> str | None:
        from files.utils import generate_file_token
        if obj.file:
            token = generate_file_token(str(obj.file.name), str(obj.applicant_id))
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(f"/api/files/{token}/")
        return None

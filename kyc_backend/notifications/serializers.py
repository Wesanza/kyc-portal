from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id", "recipient_type", "message",
            "is_read", "applicant_id", "section_name", "created_at",
        ]
        read_only_fields = fields

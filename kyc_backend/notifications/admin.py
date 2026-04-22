from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient_type", "recipient_id", "message_preview", "is_read", "created_at")
    list_filter = ("recipient_type", "is_read")
    search_fields = ("recipient_id", "message")
    readonly_fields = ("id", "created_at")
    ordering = ("-created_at",)

    def message_preview(self, obj):
        return obj.message[:80]
    message_preview.short_description = "Message"

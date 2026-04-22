from django.contrib import admin
from .models import Applicant


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "invite_used", "invite_expires_at", "is_active", "created_at")
    list_filter = ("invite_used", "is_active")
    search_fields = ("full_name", "email")
    readonly_fields = ("id", "invite_token", "session_token", "created_at", "updated_at")
    ordering = ("-created_at",)

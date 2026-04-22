from django.contrib import admin
from .models import ReviewLog


@admin.register(ReviewLog)
class ReviewLogAdmin(admin.ModelAdmin):
    list_display = ("applicant", "section_name", "old_status", "new_status", "reviewer", "created_at")
    list_filter = ("section_name", "new_status")
    search_fields = ("applicant__full_name", "applicant__email", "reviewer__email")
    readonly_fields = ("applicant", "section_name", "reviewer", "old_status", "new_status", "notes", "created_at")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

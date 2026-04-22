from django.contrib import admin
from .models import (
    EmploymentContract, Payslip, IdentityDocument,
    HomeAddress, OfficeAddress, SocialMedia,
    ContactDetails, NextOfKin,
)


class KYCSectionAdmin(admin.ModelAdmin):
    list_display = ("applicant", "status", "created_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("applicant__full_name", "applicant__email")
    readonly_fields = ("created_at", "updated_at")


@admin.register(EmploymentContract)
class EmploymentContractAdmin(KYCSectionAdmin):
    pass


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ("applicant", "month_label", "is_certified", "status", "uploaded_at")
    list_filter = ("status", "is_certified")
    search_fields = ("applicant__full_name", "applicant__email")


@admin.register(IdentityDocument)
class IdentityDocumentAdmin(KYCSectionAdmin):
    pass


@admin.register(HomeAddress)
class HomeAddressAdmin(KYCSectionAdmin):
    pass


@admin.register(OfficeAddress)
class OfficeAddressAdmin(KYCSectionAdmin):
    pass


@admin.register(SocialMedia)
class SocialMediaAdmin(KYCSectionAdmin):
    pass


@admin.register(ContactDetails)
class ContactDetailsAdmin(KYCSectionAdmin):
    pass


@admin.register(NextOfKin)
class NextOfKinAdmin(KYCSectionAdmin):
    list_display = ("applicant", "full_name", "relationship", "status", "created_at")

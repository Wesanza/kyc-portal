import os
import uuid

from django.db import models

from applicants.models import Applicant
from .constants import SECTION_STATUS_CHOICES, DEFAULT_STATUS
from .validators import (
    validate_file_size, validate_file_extension,
    validate_google_maps_url, extract_lat_lng,
    validate_kra_pin, validate_id_number,
    validate_kenyan_phone,
    validate_facebook_url, validate_instagram_url, validate_linkedin_url,
)

def employment_contract_upload_path(instance, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    return f"kyc/{instance.applicant_id}/employment_contract/{uuid.uuid4().hex}{ext}"

def payslip_upload_path(instance, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    return f"kyc/{instance.applicant_id}/payslips/{uuid.uuid4().hex}{ext}"

def identity_upload_path(instance, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    return f"kyc/{instance.applicant_id}/identity/{uuid.uuid4().hex}{ext}"

def _upload_path(section: str):
    def _path(instance, filename: str) -> str:
        ext = os.path.splitext(filename)[1].lower()
        return f"kyc/{instance.applicant_id}/{section}/{uuid.uuid4().hex}{ext}"
    return _path


# ---------------------------------------------------------------------------
# Abstract base
# ---------------------------------------------------------------------------

class KYCSectionBase(models.Model):
    applicant = models.OneToOneField(
        Applicant,
        on_delete=models.CASCADE,
        related_name="%(class)s",
    )
    status = models.CharField(
        max_length=25,
        choices=SECTION_STATUS_CHOICES,
        default=DEFAULT_STATUS,
        db_index=True,
    )
    reviewer_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ---------------------------------------------------------------------------
# 1. Employment Contract
# ---------------------------------------------------------------------------

class EmploymentContract(KYCSectionBase):
    file = models.FileField(
        upload_to=employment_contract_upload_path,
        validators=[validate_file_size, validate_file_extension],
    )

    class Meta:
        verbose_name = "Employment Contract"
        verbose_name_plural = "Employment Contracts"

    def __str__(self) -> str:
        return f"EmploymentContract — {self.applicant}"


# ---------------------------------------------------------------------------
# 2. Payslip
# ---------------------------------------------------------------------------

class Payslip(models.Model):
    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE,
        related_name="payslips",
    )
    file = models.FileField(
        upload_to=payslip_upload_path,
        validators=[validate_file_size, validate_file_extension],
    )
    month_label = models.CharField(max_length=20, help_text='e.g. "March 2025"')
    is_certified = models.BooleanField(default=False)
    status = models.CharField(
        max_length=25,
        choices=SECTION_STATUS_CHOICES,
        default=DEFAULT_STATUS,
        db_index=True,
    )
    reviewer_notes = models.TextField(blank=True, default="")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Payslip"
        verbose_name_plural = "Payslips"
        ordering = ["month_label"]
        constraints = [
            models.UniqueConstraint(
                fields=["applicant", "month_label"],
                name="unique_payslip_per_month",
            )
        ]

    def __str__(self) -> str:
        return f"Payslip ({self.month_label}) — {self.applicant}"


# ---------------------------------------------------------------------------
# 3. Identity Document
# ---------------------------------------------------------------------------

class IdentityDocument(KYCSectionBase):
    kra_pin_file = models.FileField(
        upload_to=identity_upload_path,
        validators=[validate_file_size, validate_file_extension],
    )
    national_id_file = models.FileField(
        upload_to=identity_upload_path,
        validators=[validate_file_size, validate_file_extension],
    )
    kra_pin_number = models.CharField(
        max_length=11,
        validators=[validate_kra_pin],
        help_text="Format: A000000000A",
    )
    id_number = models.CharField(
        max_length=8,
        validators=[validate_id_number],
        help_text="7–8 digit Kenyan National ID number",
    )

    class Meta:
        verbose_name = "Identity Document"
        verbose_name_plural = "Identity Documents"

    def __str__(self) -> str:
        return f"IdentityDocument — {self.applicant}"

    def save(self, *args, **kwargs):
        self.kra_pin_number = self.kra_pin_number.upper()
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# 4. Home Address
# ---------------------------------------------------------------------------

class HomeAddress(KYCSectionBase):
    address_text = models.TextField()
    google_maps_pin_url = models.URLField(max_length=500, validators=[validate_google_maps_url])
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    class Meta:
        verbose_name = "Home Address"
        verbose_name_plural = "Home Addresses"

    def __str__(self) -> str:
        return f"HomeAddress — {self.applicant}"

    def save(self, *args, **kwargs):
        if self.google_maps_pin_url and (not self.latitude or not self.longitude):
            lat, lng = extract_lat_lng(self.google_maps_pin_url)
            if lat:
                self.latitude, self.longitude = lat, lng
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# 5. Office Address
# ---------------------------------------------------------------------------

class OfficeAddress(KYCSectionBase):
    address_text = models.TextField()
    google_maps_pin_url = models.URLField(max_length=500, validators=[validate_google_maps_url])
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    class Meta:
        verbose_name = "Office Address"
        verbose_name_plural = "Office Addresses"

    def __str__(self) -> str:
        return f"OfficeAddress — {self.applicant}"

    def save(self, *args, **kwargs):
        if self.google_maps_pin_url and (not self.latitude or not self.longitude):
            lat, lng = extract_lat_lng(self.google_maps_pin_url)
            if lat:
                self.latitude, self.longitude = lat, lng
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# 6. Social Media  (LinkedIn added)
# ---------------------------------------------------------------------------

class SocialMedia(KYCSectionBase):
    facebook_url = models.URLField(
        max_length=300, blank=True, validators=[validate_facebook_url]
    )
    instagram_url = models.URLField(
        max_length=300, blank=True, validators=[validate_instagram_url]
    )
    linkedin_url = models.URLField(
        max_length=300, blank=True, validators=[validate_linkedin_url]
    )

    class Meta:
        verbose_name = "Social Media"
        verbose_name_plural = "Social Media Entries"

    def __str__(self) -> str:
        return f"SocialMedia — {self.applicant}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.facebook_url and not self.instagram_url and not self.linkedin_url:
            raise ValidationError(
                "At least one social media URL (Facebook, Instagram, or LinkedIn) is required."
            )


# ---------------------------------------------------------------------------
# 7. Contact Details
# ---------------------------------------------------------------------------

class ContactDetails(KYCSectionBase):
    phone_primary = models.CharField(max_length=20, validators=[validate_kenyan_phone])
    phone_secondary = models.CharField(
        max_length=20, blank=True, validators=[validate_kenyan_phone]
    )

    class Meta:
        verbose_name = "Contact Details"
        verbose_name_plural = "Contact Details"

    def __str__(self) -> str:
        return f"ContactDetails — {self.applicant}"


# ---------------------------------------------------------------------------
# 8. Next of Kin
# ---------------------------------------------------------------------------

class NextOfKin(KYCSectionBase):
    class Relationship(models.TextChoices):
        SPOUSE  = "SPOUSE",  "Spouse"
        PARENT  = "PARENT",  "Parent"
        SIBLING = "SIBLING", "Sibling"
        CHILD   = "CHILD",   "Child"
        OTHER   = "OTHER",   "Other"

    full_name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=20, choices=Relationship.choices)
    relationship_other = models.CharField(max_length=100, blank=True)
    phone_primary = models.CharField(max_length=20, validators=[validate_kenyan_phone])
    phone_secondary = models.CharField(
        max_length=20, blank=True, validators=[validate_kenyan_phone]
    )

    class Meta:
        verbose_name = "Next of Kin"
        verbose_name_plural = "Next of Kin"

    def __str__(self) -> str:
        return f"NextOfKin ({self.full_name}) — {self.applicant}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.relationship == self.Relationship.OTHER and not self.relationship_other:
            raise ValidationError({"relationship_other": "Please specify the relationship."})


# ---------------------------------------------------------------------------
# 9. Referred By
# ---------------------------------------------------------------------------

class ReferredBy(KYCSectionBase):
    referrer_name = models.CharField(max_length=255)
    referrer_relationship = models.CharField(max_length=100)
    referrer_phone = models.CharField(
        max_length=20, blank=True, validators=[validate_kenyan_phone]
    )
    referrer_email = models.EmailField(max_length=254, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Referred By"
        verbose_name_plural = "Referred By Entries"

    def __str__(self) -> str:
        return f"ReferredBy ({self.referrer_name}) — {self.applicant}"
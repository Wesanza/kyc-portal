"""
Factory Boy factories for all models.
Import from tests anywhere in the project.
"""
import uuid
import factory
from factory.django import DjangoModelFactory
from django.utils import timezone
from datetime import timedelta


class UserFactory(DjangoModelFactory):
    class Meta:
        model = "accounts.User"

    email = factory.Sequence(lambda n: f"staff{n}@company.com")
    full_name = factory.Faker("name")
    role = "HR"
    is_active = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        kwargs.setdefault("password", "testpass123")
        manager = cls._get_manager(model_class)
        return manager.create_user(**kwargs)


class AdminUserFactory(UserFactory):
    role = "ADMIN"
    is_staff = True


class ApplicantFactory(DjangoModelFactory):
    class Meta:
        model = "applicants.Applicant"

    full_name = factory.Faker("name")
    email = factory.Sequence(lambda n: f"applicant{n}@example.com")
    phone = "+254700000001"
    created_by = factory.SubFactory(UserFactory)
    invite_token = factory.LazyFunction(uuid.uuid4)
    invite_used = False
    invite_expires_at = factory.LazyFunction(lambda: timezone.now() + timedelta(days=30))
    is_active = True


class EmploymentContractFactory(DjangoModelFactory):
    class Meta:
        model = "documents.EmploymentContract"

    applicant = factory.SubFactory(ApplicantFactory)
    status = "PENDING"
    reviewer_notes = ""

    @factory.lazy_attribute
    def file(self):
        from django.core.files.base import ContentFile
        return ContentFile(b"%PDF-1.4 fake content", name="contract.pdf")


class PayslipFactory(DjangoModelFactory):
    class Meta:
        model = "documents.Payslip"

    applicant = factory.SubFactory(ApplicantFactory)
    month_label = "January 2025"
    is_certified = False
    status = "PENDING"

    @factory.lazy_attribute
    def file(self):
        from django.core.files.base import ContentFile
        return ContentFile(b"%PDF-1.4 fake content", name="payslip.pdf")


class IdentityDocumentFactory(DjangoModelFactory):
    class Meta:
        model = "documents.IdentityDocument"

    applicant = factory.SubFactory(ApplicantFactory)
    kra_pin_number = "A123456789B"
    id_number = "12345678"
    status = "PENDING"

    @factory.lazy_attribute
    def kra_pin_file(self):
        from django.core.files.base import ContentFile
        return ContentFile(b"%PDF-1.4", name="kra.pdf")

    @factory.lazy_attribute
    def national_id_file(self):
        from django.core.files.base import ContentFile
        return ContentFile(b"%PDF-1.4", name="id.pdf")


class HomeAddressFactory(DjangoModelFactory):
    class Meta:
        model = "documents.HomeAddress"

    applicant = factory.SubFactory(ApplicantFactory)
    address_text = "123 Westlands Road, Nairobi"
    google_maps_pin_url = "https://maps.app.goo.gl/testpin123"
    status = "PENDING"


class SocialMediaFactory(DjangoModelFactory):
    class Meta:
        model = "documents.SocialMedia"

    applicant = factory.SubFactory(ApplicantFactory)
    facebook_url = "https://facebook.com/testuser"
    instagram_url = ""
    status = "PENDING"


class ContactDetailsFactory(DjangoModelFactory):
    class Meta:
        model = "documents.ContactDetails"

    applicant = factory.SubFactory(ApplicantFactory)
    phone_primary = "+254712345678"
    phone_secondary = ""
    status = "PENDING"


class NextOfKinFactory(DjangoModelFactory):
    class Meta:
        model = "documents.NextOfKin"

    applicant = factory.SubFactory(ApplicantFactory)
    full_name = "Jane Doe"
    relationship = "SPOUSE"
    phone_primary = "+254712345678"
    status = "PENDING"

import uuid
import pytest
from django.utils import timezone
from datetime import timedelta


pytestmark = pytest.mark.django_db


class TestApplicantModel:
    def test_create_applicant(self, django_user_model):
        from applicants.models import Applicant
        hr = django_user_model.objects.create_user(email="hr@test.com", full_name="HR", password="p")
        applicant = Applicant.objects.create(
            full_name="John Doe",
            email="john@test.com",
            phone="+254700000001",
            created_by=hr,
        )
        applicant.set_invite_expiry()
        applicant.save()
        assert applicant.pk is not None
        assert isinstance(applicant.invite_token, uuid.UUID)
        assert not applicant.invite_expired

    def test_invite_expired(self):
        from applicants.models import Applicant
        applicant = Applicant(
            full_name="Expired User",
            email="expired@test.com",
            invite_expires_at=timezone.now() - timedelta(days=1),
        )
        assert applicant.invite_expired

    def test_invite_url_format(self, settings):
        from applicants.models import Applicant
        settings.FRONTEND_BASE_URL = "https://kyc.example.com"
        token = uuid.uuid4()
        applicant = Applicant(full_name="Test", email="t@t.com", invite_token=token)
        assert applicant.invite_url == f"https://kyc.example.com/onboard/{token}"

    def test_issue_session_token(self, django_user_model):
        from applicants.models import Applicant
        hr = django_user_model.objects.create_user(email="hr2@test.com", full_name="HR2", password="p")
        applicant = Applicant.objects.create(
            full_name="Jane Doe",
            email="jane@test.com",
            created_by=hr,
        )
        applicant.set_invite_expiry()
        applicant.save()

        session_token = applicant.issue_session_token()
        assert isinstance(session_token, uuid.UUID)
        assert applicant.invite_used is True
        applicant.refresh_from_db()
        assert applicant.session_token == session_token

    def test_regenerate_invite(self, django_user_model):
        from applicants.models import Applicant
        hr = django_user_model.objects.create_user(email="hr3@test.com", full_name="HR3", password="p")
        applicant = Applicant.objects.create(
            full_name="Regen User",
            email="regen@test.com",
            created_by=hr,
        )
        applicant.set_invite_expiry()
        applicant.save()
        old_token = applicant.invite_token
        applicant.regenerate_invite()
        assert applicant.invite_token != old_token
        assert not applicant.invite_used

    def test_soft_delete_does_not_remove_record(self, django_user_model):
        from applicants.models import Applicant
        hr = django_user_model.objects.create_user(email="hr4@test.com", full_name="HR4", password="p")
        applicant = Applicant.objects.create(
            full_name="Soft Delete",
            email="softdelete@test.com",
            created_by=hr,
        )
        applicant.is_active = False
        applicant.save()
        assert Applicant.objects.filter(pk=applicant.pk).exists()
        assert not Applicant.objects.filter(pk=applicant.pk, is_active=True).exists()

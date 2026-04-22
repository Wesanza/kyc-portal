import pytest
from reviews.models import ReviewLog


pytestmark = pytest.mark.django_db


class TestReviewLogImmutability:
    def test_insert_creates_record(self, django_user_model):
        from applicants.models import Applicant
        hr = django_user_model.objects.create_user(email="hr@test.com", full_name="HR", password="p")
        applicant = Applicant.objects.create(full_name="Test", email="t@t.com", created_by=hr)

        log = ReviewLog.objects.create(
            applicant=applicant,
            section_name="employment_contract",
            reviewer=hr,
            old_status="PENDING",
            new_status="APPROVED",
            notes="Looks good",
        )
        assert log.pk is not None

    def test_update_raises_permission_error(self, django_user_model):
        from applicants.models import Applicant
        hr = django_user_model.objects.create_user(email="hr2@test.com", full_name="HR2", password="p")
        applicant = Applicant.objects.create(full_name="Test2", email="t2@t.com", created_by=hr)
        log = ReviewLog.objects.create(
            applicant=applicant,
            section_name="identity",
            reviewer=hr,
            old_status="IN_REVIEW",
            new_status="REJECTED",
            notes="Missing docs",
        )
        with pytest.raises(PermissionError, match="immutable"):
            log.notes = "Changed"
            log.save()

    def test_delete_raises_permission_error(self, django_user_model):
        from applicants.models import Applicant
        hr = django_user_model.objects.create_user(email="hr3@test.com", full_name="HR3", password="p")
        applicant = Applicant.objects.create(full_name="Test3", email="t3@t.com", created_by=hr)
        log = ReviewLog.objects.create(
            applicant=applicant,
            section_name="payslips",
            reviewer=hr,
            old_status="PENDING",
            new_status="IN_REVIEW",
        )
        with pytest.raises(PermissionError, match="immutable"):
            log.delete()

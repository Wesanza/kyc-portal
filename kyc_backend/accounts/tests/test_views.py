import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class TestUserModel:
    def test_create_user(self, django_user_model):
        user = django_user_model.objects.create_user(
            email="test@example.com", full_name="Test User", password="pass123"
        )
        assert user.email == "test@example.com"
        assert user.role == "HR"
        assert not user.is_admin
        assert user.is_hr

    def test_create_superuser(self, django_user_model):
        user = django_user_model.objects.create_superuser(
            email="admin@example.com", full_name="Admin", password="pass123"
        )
        assert user.role == "ADMIN"
        assert user.is_staff
        assert user.is_superuser
        assert user.is_admin

    def test_str(self, django_user_model):
        user = django_user_model.objects.create_user(
            email="hr@example.com", full_name="HR User", password="pass"
        )
        assert "HR User" in str(user)
        assert "hr@example.com" in str(user)

    def test_email_required(self, django_user_model):
        with pytest.raises(ValueError, match="Email"):
            django_user_model.objects.create_user(email="", full_name="X", password="x")


# ---------------------------------------------------------------------------
# Auth view tests
# ---------------------------------------------------------------------------

class TestLoginView:
    def test_login_success(self, django_user_model):
        django_user_model.objects.create_user(
            email="user@test.com", full_name="Test", password="strongpass99"
        )
        client = APIClient()
        resp = client.post(reverse("auth-login"), {"email": "user@test.com", "password": "strongpass99"})
        assert resp.status_code == status.HTTP_200_OK
        assert "access" in resp.data
        assert "refresh" in resp.data
        assert resp.data["user"]["email"] == "user@test.com"

    def test_login_wrong_password(self, django_user_model):
        django_user_model.objects.create_user(
            email="user@test.com", full_name="Test", password="correctpass"
        )
        client = APIClient()
        resp = client.post(reverse("auth-login"), {"email": "user@test.com", "password": "wrongpass"})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_inactive_user(self, django_user_model):
        django_user_model.objects.create_user(
            email="user@test.com", full_name="Test", password="pass", is_active=False
        )
        client = APIClient()
        resp = client.post(reverse("auth-login"), {"email": "user@test.com", "password": "pass"})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_me_endpoint_requires_auth(self):
        client = APIClient()
        resp = client.get(reverse("auth-me"))
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_endpoint_returns_user(self, django_user_model):
        user = django_user_model.objects.create_user(
            email="me@test.com", full_name="Me User", password="pass123"
        )
        client = APIClient()
        client.force_authenticate(user=user)
        resp = client.get(reverse("auth-me"))
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["email"] == "me@test.com"


# ---------------------------------------------------------------------------
# Permission tests
# ---------------------------------------------------------------------------

class TestPermissions:
    def test_is_admin_or_hr_allows_hr(self, django_user_model):
        from accounts.permissions import IsAdminOrHR
        from unittest.mock import Mock
        user = django_user_model.objects.create_user(
            email="hr@test.com", full_name="HR", password="pass", role="HR"
        )
        request = Mock()
        request.user = user
        perm = IsAdminOrHR()
        assert perm.has_permission(request, None)

    def test_is_admin_or_hr_blocks_applicant(self):
        from accounts.permissions import IsAdminOrHR
        from accounts.authentication import ApplicantPrincipal
        from unittest.mock import Mock, MagicMock
        mock_applicant = MagicMock()
        mock_applicant.pk = "some-uuid"
        principal = ApplicantPrincipal(mock_applicant)
        request = Mock()
        request.user = principal
        perm = IsAdminOrHR()
        assert not perm.has_permission(request, None)

    def test_is_admin_only_blocks_hr(self, django_user_model):
        from accounts.permissions import IsAdminOnly
        from unittest.mock import Mock
        user = django_user_model.objects.create_user(
            email="hr2@test.com", full_name="HR2", password="pass", role="HR"
        )
        request = Mock()
        request.user = user
        perm = IsAdminOnly()
        assert not perm.has_permission(request, None)

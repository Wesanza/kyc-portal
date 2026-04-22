from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicantViewSet

router = DefaultRouter()
router.register("applicants", ApplicantViewSet, basename="admin-applicants")

urlpatterns = [
    path("", include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicantViewSet, InviteValidateView

router = DefaultRouter()
router.register("applicants", ApplicantViewSet, basename="applicant")

urlpatterns = [
    path("", include(router.urls)),
    path("../../api/applicant/invite/<uuid:token>/validate/", InviteValidateView.as_view(), name="invite-validate"),
]

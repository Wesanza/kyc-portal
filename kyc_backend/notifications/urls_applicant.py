from django.urls import path
from .views import ApplicantNotificationListView, ApplicantMarkReadView, ApplicantMarkAllReadView

urlpatterns = [
    path("", ApplicantNotificationListView.as_view(), name="applicant-notifications-list"),
    path("mark-all-read/", ApplicantMarkAllReadView.as_view(), name="applicant-notifications-mark-all-read"),
    path("<uuid:notification_id>/read/", ApplicantMarkReadView.as_view(), name="applicant-notification-read"),
]

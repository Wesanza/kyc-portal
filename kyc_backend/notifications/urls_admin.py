from django.urls import path
from .views import AdminNotificationListView, AdminMarkReadView, AdminMarkAllReadView

urlpatterns = [
    path("", AdminNotificationListView.as_view(), name="admin-notifications-list"),
    path("mark-all-read/", AdminMarkAllReadView.as_view(), name="admin-notifications-mark-all-read"),
    path("<uuid:notification_id>/read/", AdminMarkReadView.as_view(), name="admin-notification-read"),
]

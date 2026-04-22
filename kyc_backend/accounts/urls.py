from django.urls import path
from .views import (
    LoginView, LogoutView, TokenRefreshView,
    MeView, ChangePasswordView,
    NotificationPreferencesView, InviteSettingsView,
)

urlpatterns = [
    # Auth
    path("login/",           LoginView.as_view(),        name="auth-login"),
    path("logout/",          LogoutView.as_view(),        name="auth-logout"),
    path("refresh/",         TokenRefreshView.as_view(),  name="auth-refresh"),
    path("me/",              MeView.as_view(),            name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(),name="auth-change-password"),

    # Settings
    path(
        "admin/settings/notifications/",
        NotificationPreferencesView.as_view(),
        name="settings-notifications",
    ),
    path(
        "admin/settings/invites/",
        InviteSettingsView.as_view(),
        name="settings-invites",
    ),
]
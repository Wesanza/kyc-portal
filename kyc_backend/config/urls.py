from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("django-admin/", admin.site.urls),

    # Auth
    path("api/auth/", include("accounts.urls")),

    # Admin-facing endpoints
    path("api/admin/", include("applicants.urls_admin")),
    path("api/admin/", include("reviews.urls")),
    path("api/admin/notifications/", include("notifications.urls_admin")),

    # Applicant-facing endpoints
    path("api/applicant/", include("applicants.urls_applicant")),
    path("api/applicant/kyc/", include("documents.urls")),
    path("api/applicant/notifications/", include("notifications.urls_applicant")),

    # Secure file serving
    path("api/files/", include("files.urls")),

    # OpenAPI schema
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

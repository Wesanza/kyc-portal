from django.urls import path
from .views import SecureFileView

urlpatterns = [
    path("<str:file_token>/", SecureFileView.as_view(), name="secure-file"),
]

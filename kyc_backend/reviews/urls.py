from django.urls import path
from .views import KYCSectionsListView, SectionReviewView, ReviewLogView

urlpatterns = [
    # List all sections + statuses for an applicant
    path("kyc/<uuid:applicant_id>/sections/", KYCSectionsListView.as_view(), name="admin-kyc-sections"),

    # Per-section review action
    path("kyc/<uuid:applicant_id>/<str:section>/review/", SectionReviewView.as_view(), name="admin-section-review"),

    # Audit trail
    path("kyc/<uuid:applicant_id>/review-log/", ReviewLogView.as_view(), name="admin-review-log"),
]

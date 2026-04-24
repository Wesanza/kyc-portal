from django.urls import path
from documents.views import (
    EmploymentContractView,
    PayslipsView,
    IdentityView,
    HomeAddressView,
    OfficeAddressView,
    SocialMediaView,
    ContactDetailsView,
    NextOfKinView,
    # ReferredByView,
    KYCStatusView,
)
from documents.views.sections import ReferredByView

urlpatterns = [
    path("employment-contract/", EmploymentContractView.as_view(), name="kyc-employment-contract"),
    path("payslips/",            PayslipsView.as_view(),            name="kyc-payslips"),
    path("identity/",            IdentityView.as_view(),            name="kyc-identity"),
    path("home-address/",        HomeAddressView.as_view(),         name="kyc-home-address"),
    path("office-address/",      OfficeAddressView.as_view(),       name="kyc-office-address"),
    path("social-media/",        SocialMediaView.as_view(),         name="kyc-social-media"),
    path("contact-details/",     ContactDetailsView.as_view(),      name="kyc-contact-details"),
    path("next-of-kin/",         NextOfKinView.as_view(),           name="kyc-next-of-kin"),
    path("referred-by/",         ReferredByView.as_view(),          name="kyc-referred-by"),
    path("status/",              KYCStatusView.as_view(),           name="kyc-status"),
]
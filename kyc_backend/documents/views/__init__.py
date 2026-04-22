from .employment_contract import EmploymentContractView
from .payslip import PayslipsView
from .sections import (
    IdentityView,
    HomeAddressView,
    OfficeAddressView,
    SocialMediaView,
    ContactDetailsView,
    # NextOfKinView,
)
from .next_of_kin import NextOfKinView
from .status import KYCStatusView

__all__ = [
    "EmploymentContractView",
    "PayslipsView",
    "IdentityView",
    "HomeAddressView",
    "OfficeAddressView",
    "SocialMediaView",
    "ContactDetailsView",
    "NextOfKinView",
    "KYCStatusView",
]

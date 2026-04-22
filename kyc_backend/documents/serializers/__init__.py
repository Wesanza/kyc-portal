from .employment_contract import EmploymentContractSerializer
from .payslip import PayslipSerializer, PayslipBulkSerializer
from .identity import IdentityDocumentSerializer
from .address import HomeAddressSerializer, OfficeAddressSerializer
from .social_media import SocialMediaSerializer
from .contact_details import ContactDetailsSerializer
from .next_of_kin import NextOfKinSerializer

__all__ = [
    "EmploymentContractSerializer",
    "PayslipSerializer",
    "PayslipBulkSerializer",
    "IdentityDocumentSerializer",
    "HomeAddressSerializer",
    "OfficeAddressSerializer",
    "SocialMediaSerializer",
    "ContactDetailsSerializer",
    "NextOfKinSerializer",
]

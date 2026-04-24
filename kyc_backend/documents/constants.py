from django.conf import settings

# ---------------------------------------------------------------------------
# Status choices (shared across all KYC section models)
# ---------------------------------------------------------------------------

SECTION_STATUS_CHOICES = [
    ("PENDING", "Pending"),
    ("IN_REVIEW", "In Review"),
    ("APPROVED", "Approved"),
    ("REJECTED", "Rejected"),
    ("REVISION_REQUESTED", "Revision Requested"),
]

DEFAULT_STATUS = "PENDING"

# ---------------------------------------------------------------------------
# All KYC section identifiers (canonical ordering)
# ---------------------------------------------------------------------------

KYC_SECTIONS = [
    "employment_contract",
    "payslips",
    "identity",
    "home_address",
    "office_address",
    "social_media",
    "contact_details",
    "next_of_kin",
    "referred_by",
]

KYC_SECTION_LABELS = {
    "employment_contract": "Employment Contract",
    "payslips": "Payslips",
    "identity": "KRA PIN & National ID",
    "home_address": "Home Address",
    "office_address": "Office Address",
    "social_media": "Social Media",
    "contact_details": "Contact Details",
    "next_of_kin": "Next of Kin",
    "referred_by": "Referred By",
}

# ---------------------------------------------------------------------------
# File upload limits
# ---------------------------------------------------------------------------
MAX_FILE_SIZE_BYTES = getattr(settings, "MAX_FILE_SIZE_MB", 10) * 1024 * 1024
ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"]
ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]

MAX_PAYSLIPS = 3
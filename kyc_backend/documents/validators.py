import re
from urllib.parse import urlparse

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from .constants import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES


# ---------------------------------------------------------------------------
# Google Maps URL validator
# ---------------------------------------------------------------------------

GOOGLE_MAPS_PATTERNS = [
    re.compile(r"^https://maps\.app\.goo\.gl/"),
    re.compile(r"^https://(www\.)?google\.com/maps/"),
    re.compile(r"^https://goo\.gl/maps/"),
]

LAT_LNG_RE = re.compile(r"@(-?\d+\.\d+),(-?\d+\.\d+)")


def validate_google_maps_url(url: str) -> None:
    """
    Raise ValidationError if `url` is not a recognisable Google Maps pin URL.
    Accepted formats:
        https://maps.app.goo.gl/...
        https://www.google.com/maps/...
        https://google.com/maps/...
        https://goo.gl/maps/...
    """
    if not url:
        return  # empty is handled by field required= flag

    if not any(pattern.match(url) for pattern in GOOGLE_MAPS_PATTERNS):
        raise ValidationError(
            _("Enter a valid Google Maps URL (e.g. https://maps.app.goo.gl/… or https://www.google.com/maps/…)"),
            code="invalid_google_maps_url",
        )


def extract_lat_lng(url: str) -> tuple[float | None, float | None]:
    """
    Parse latitude and longitude from a full Google Maps URL.
    Returns (None, None) if not found (e.g. short URLs).
    """
    match = LAT_LNG_RE.search(url)
    if match:
        return float(match.group(1)), float(match.group(2))
    return None, None


# ---------------------------------------------------------------------------
# KRA PIN validator
# ---------------------------------------------------------------------------

KRA_PIN_RE = re.compile(r"^[A-Z]\d{9}[A-Z]$")


def validate_kra_pin(value: str) -> None:
    """
    KRA PIN format: letter + 9 digits + letter, e.g. A000000000A
    """
    if not KRA_PIN_RE.match(value.upper()):
        raise ValidationError(
            _("Enter a valid KRA PIN (format: A000000000A — one letter, 9 digits, one letter)."),
            code="invalid_kra_pin",
        )


# ---------------------------------------------------------------------------
# National ID validator (Kenya — 8 digits)
# ---------------------------------------------------------------------------

ID_NUMBER_RE = re.compile(r"^\d{7,8}$")


def validate_id_number(value: str) -> None:
    if not ID_NUMBER_RE.match(value):
        raise ValidationError(
            _("Enter a valid Kenyan National ID number (7–8 digits)."),
            code="invalid_id_number",
        )


# ---------------------------------------------------------------------------
# Phone number validator (Kenyan format)
# ---------------------------------------------------------------------------

KENYAN_PHONE_RE = re.compile(r"^(\+254|0)[17]\d{8}$")


def validate_kenyan_phone(value: str) -> None:
    if not KENYAN_PHONE_RE.match(value):
        raise ValidationError(
            _("Enter a valid Kenyan phone number (+254XXXXXXXXX or 07XXXXXXXX / 01XXXXXXXX)."),
            code="invalid_kenyan_phone",
        )


# ---------------------------------------------------------------------------
# File validators
# ---------------------------------------------------------------------------

def validate_file_size(file) -> None:
    if file.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            _(f"File size must not exceed {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."),
            code="file_too_large",
        )


def validate_file_extension(file) -> None:
    import os
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            _(f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}."),
            code="invalid_file_type",
        )


# ---------------------------------------------------------------------------
# Social media URL validators
# ---------------------------------------------------------------------------

def validate_facebook_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or "facebook.com" not in parsed.netloc:
        raise ValidationError(_("Enter a valid Facebook profile URL."), code="invalid_facebook_url")


def validate_instagram_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or "instagram.com" not in parsed.netloc:
        raise ValidationError(_("Enter a valid Instagram profile URL."), code="invalid_instagram_url")

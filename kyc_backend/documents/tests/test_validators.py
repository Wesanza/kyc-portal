import pytest
from django.core.exceptions import ValidationError
from documents.validators import (
    validate_google_maps_url,
    validate_kra_pin,
    validate_id_number,
    validate_kenyan_phone,
    validate_facebook_url,
    validate_instagram_url,
    extract_lat_lng,
)


class TestGoogleMapsValidator:
    @pytest.mark.parametrize("url", [
        "https://maps.app.goo.gl/abc123",
        "https://www.google.com/maps/place/Nairobi",
        "https://google.com/maps/@-1.286389,36.817223,15z",
        "https://goo.gl/maps/xyz",
    ])
    def test_valid_urls(self, url):
        # Should not raise
        validate_google_maps_url(url)

    @pytest.mark.parametrize("url", [
        "https://apple.com/maps/",
        "https://bing.com/maps",
        "not-a-url",
        "http://maps.google.com/",  # http not https
    ])
    def test_invalid_urls(self, url):
        with pytest.raises(ValidationError):
            validate_google_maps_url(url)

    def test_empty_url_passes(self):
        # Empty is handled by required=True at field level
        validate_google_maps_url("")

    def test_extract_lat_lng(self):
        url = "https://www.google.com/maps/@-1.286389,36.817223,15z"
        lat, lng = extract_lat_lng(url)
        assert abs(lat - (-1.286389)) < 0.0001
        assert abs(lng - 36.817223) < 0.0001

    def test_extract_lat_lng_short_url(self):
        lat, lng = extract_lat_lng("https://maps.app.goo.gl/abc")
        assert lat is None
        assert lng is None


class TestKraPinValidator:
    @pytest.mark.parametrize("pin", ["A123456789B", "P987654321Z"])
    def test_valid_pins(self, pin):
        validate_kra_pin(pin)

    @pytest.mark.parametrize("pin", ["A12345678", "12345678901", "AAAAAAAAAAA", "A1234567890"])
    def test_invalid_pins(self, pin):
        with pytest.raises(ValidationError):
            validate_kra_pin(pin)


class TestIdNumberValidator:
    @pytest.mark.parametrize("id_num", ["12345678", "1234567"])
    def test_valid(self, id_num):
        validate_id_number(id_num)

    @pytest.mark.parametrize("id_num", ["123456", "123456789", "ABCDEFGH"])
    def test_invalid(self, id_num):
        with pytest.raises(ValidationError):
            validate_id_number(id_num)


class TestKenyanPhoneValidator:
    @pytest.mark.parametrize("phone", [
        "+254712345678",
        "+254112345678",
        "0712345678",
        "0112345678",
    ])
    def test_valid(self, phone):
        validate_kenyan_phone(phone)

    @pytest.mark.parametrize("phone", [
        "0812345678",   # invalid prefix
        "+1234567890",  # not Kenyan
        "712345678",    # missing 0 or +254
    ])
    def test_invalid(self, phone):
        with pytest.raises(ValidationError):
            validate_kenyan_phone(phone)


class TestSocialMediaValidators:
    def test_valid_facebook(self):
        validate_facebook_url("https://facebook.com/johndoe")
        validate_facebook_url("https://www.facebook.com/profile.php?id=123")

    def test_invalid_facebook(self):
        with pytest.raises(ValidationError):
            validate_facebook_url("https://twitter.com/johndoe")

    def test_valid_instagram(self):
        validate_instagram_url("https://instagram.com/johndoe")
        validate_instagram_url("https://www.instagram.com/johndoe/")

    def test_invalid_instagram(self):
        with pytest.raises(ValidationError):
            validate_instagram_url("https://tiktok.com/@johndoe")

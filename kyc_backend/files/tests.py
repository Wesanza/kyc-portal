import time
import pytest
from files.utils import generate_file_token, verify_file_token


class TestFileTokens:
    def test_generate_and_verify(self):
        token = generate_file_token("kyc/abc/employment_contract/file.pdf", "applicant-uuid-123")
        payload = verify_file_token(token)
        assert payload is not None
        assert payload["path"] == "kyc/abc/employment_contract/file.pdf"
        assert payload["aid"] == "applicant-uuid-123"

    def test_tampered_token_fails(self):
        token = generate_file_token("some/path.pdf", "aid-456")
        tampered = token[:-5] + "XXXXX"
        assert verify_file_token(tampered) is None

    def test_expired_token_fails(self):
        # Generate a token and manually set expiry in the past
        from django.core import signing
        import time
        payload = {"path": "x.pdf", "aid": "123", "exp": int(time.time()) - 1}
        token = signing.dumps(payload, salt="kyc-file-token-v1")
        assert verify_file_token(token) is None

    def test_invalid_token_string_fails(self):
        assert verify_file_token("not-a-real-token") is None
        assert verify_file_token("") is None

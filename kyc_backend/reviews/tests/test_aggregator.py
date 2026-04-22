import pytest
from unittest.mock import patch, MagicMock
from reviews.aggregator import compute_overall_kyc_status, build_kyc_summary
from documents.constants import KYC_SECTIONS


pytestmark = pytest.mark.django_db


def _make_section_status(status_value):
    """Helper that returns a section status dict."""
    return {
        "section": "employment_contract",
        "label": "Employment Contract",
        "status": status_value,
        "submitted_at": None,
        "reviewer_notes": "",
    }


class TestComputeOverallKYCStatus:
    def _patch_section_status(self, statuses: list[str]):
        """Return a patcher that mocks _get_section_status to yield given statuses in order."""
        status_iter = iter(statuses)
        def mock_get(applicant, section):
            return {
                "section": section,
                "label": section,
                "status": next(status_iter),
                "submitted_at": None,
                "reviewer_notes": "",
            }
        return mock_get

    def test_incomplete_when_any_not_started(self):
        applicant = MagicMock()
        statuses = ["NOT_STARTED"] + ["APPROVED"] * 7
        with patch("reviews.aggregator._get_section_status", side_effect=self._patch_section_status(statuses)):
            result = compute_overall_kyc_status(applicant)
        assert result == "INCOMPLETE"

    def test_approved_when_all_approved(self):
        applicant = MagicMock()
        statuses = ["APPROVED"] * 8
        with patch("reviews.aggregator._get_section_status", side_effect=self._patch_section_status(statuses)):
            result = compute_overall_kyc_status(applicant)
        assert result == "APPROVED"

    def test_rejected_takes_priority_over_revision(self):
        applicant = MagicMock()
        statuses = ["APPROVED"] * 5 + ["REJECTED", "REVISION_REQUESTED", "APPROVED"]
        with patch("reviews.aggregator._get_section_status", side_effect=self._patch_section_status(statuses)):
            result = compute_overall_kyc_status(applicant)
        assert result == "REJECTED"

    def test_revision_requested(self):
        applicant = MagicMock()
        statuses = ["APPROVED"] * 6 + ["REVISION_REQUESTED", "PENDING"]
        with patch("reviews.aggregator._get_section_status", side_effect=self._patch_section_status(statuses)):
            result = compute_overall_kyc_status(applicant)
        assert result == "REVISION_REQUESTED"

    def test_in_review_when_all_submitted(self):
        applicant = MagicMock()
        statuses = ["APPROVED"] * 6 + ["PENDING", "IN_REVIEW"]
        with patch("reviews.aggregator._get_section_status", side_effect=self._patch_section_status(statuses)):
            result = compute_overall_kyc_status(applicant)
        assert result == "IN_REVIEW"


class TestBuildKYCSummary:
    def test_summary_structure(self):
        applicant = MagicMock()

        def mock_section(a, s):
            return {"section": s, "label": s, "status": "APPROVED", "submitted_at": None, "reviewer_notes": ""}

        with patch("reviews.aggregator._get_section_status", side_effect=mock_section):
            summary = build_kyc_summary(applicant)

        assert "overall_status" in summary
        assert "completion_percentage" in summary
        assert "sections" in summary
        assert "last_activity" in summary
        assert len(summary["sections"]) == len(KYC_SECTIONS)

    def test_completion_percentage_all_approved(self):
        applicant = MagicMock()

        def mock_section(a, s):
            return {"section": s, "label": s, "status": "APPROVED", "submitted_at": None, "reviewer_notes": ""}

        with patch("reviews.aggregator._get_section_status", side_effect=mock_section):
            summary = build_kyc_summary(applicant)

        assert summary["completion_percentage"] == 100

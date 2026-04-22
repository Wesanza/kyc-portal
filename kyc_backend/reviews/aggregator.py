"""
Pure functions for computing overall KYC status from individual section statuses.
No side effects, no DB writes — safe to call anywhere.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from documents.constants import KYC_SECTIONS, KYC_SECTION_LABELS

if TYPE_CHECKING:
    from applicants.models import Applicant


# ---------------------------------------------------------------------------
# Section → model lookup
# ---------------------------------------------------------------------------

def _get_section_instance(applicant: "Applicant", section: str):
    """Return the section model instance or None if not yet submitted."""
    model = _get_section_model(section)
    if section == "payslips":
        return list(model.objects.filter(applicant=applicant))
    try:
        return model.objects.get(applicant=applicant)
    except model.DoesNotExist:
        return None

def _get_section_model(section: str):
    """Return the Django model class for a given section name."""
    from documents.models import (
        EmploymentContract, Payslip, IdentityDocument,
        HomeAddress, OfficeAddress, SocialMedia,
        ContactDetails, NextOfKin,
    )
    mapping = {
        "employment_contract": EmploymentContract,
        "payslips": Payslip,
        "identity": IdentityDocument,
        "home_address": HomeAddress,
        "office_address": OfficeAddress,
        "social_media": SocialMedia,
        "contact_details": ContactDetails,
        "next_of_kin": NextOfKin,
    }
    return mapping[section]


def _get_section_instance_data(applicant, section, request=None):
    from reviews.serializers import get_section_serializer  

    instance = _get_section_instance(applicant, section)
    if instance is None:
        return None

    serializer_class = get_section_serializer(section)
    if serializer_class is None:
        return None

    context = {"request": request} if request else {}

    if isinstance(instance, list):  # payslips
        return serializer_class(instance, many=True, context=context).data
    return serializer_class(instance, context=context).data

# ---------------------------------------------------------------------------
# Per-section status helper
# ---------------------------------------------------------------------------

def _get_section_status(applicant: "Applicant", section: str) -> dict:
    """
    Return a status dict for a single KYC section.
    For payslips (FK, multiple) we aggregate across all payslip rows.
    """
    model = _get_section_model(section)

    if section == "payslips":
        payslips = list(model.objects.filter(applicant=applicant))
        if not payslips:
            return {"section": section, "label": KYC_SECTION_LABELS[section],
                    "status": "NOT_STARTED", "submitted_at": None, "reviewer_notes": ""}
        # Aggregate: all APPROVED only if all are approved
        statuses = [p.status for p in payslips]
        if all(s == "APPROVED" for s in statuses):
            agg_status = "APPROVED"
        elif any(s == "REJECTED" for s in statuses):
            agg_status = "REJECTED"
        elif any(s == "REVISION_REQUESTED" for s in statuses):
            agg_status = "REVISION_REQUESTED"
        elif any(s == "IN_REVIEW" for s in statuses):
            agg_status = "IN_REVIEW"
        else:
            agg_status = "PENDING"
        notes = "; ".join(p.reviewer_notes for p in payslips if p.reviewer_notes)
        return {
            "section": section,
            "label": KYC_SECTION_LABELS[section],
            "status": agg_status,
            "submitted_at": max(p.uploaded_at for p in payslips),
            "reviewer_notes": notes or "",
        }

    # OneToOne sections
    try:
        instance = model.objects.get(applicant=applicant)
        return {
            "section": section,
            "label": KYC_SECTION_LABELS[section],
            "status": instance.status,
            "submitted_at": instance.updated_at,
            "reviewer_notes": instance.reviewer_notes or "",
        }
    except model.DoesNotExist:
        return {
            "section": section,
            "label": KYC_SECTION_LABELS[section],
            "status": "NOT_STARTED",
            "submitted_at": None,
            "reviewer_notes": "",
        }


# ---------------------------------------------------------------------------
# Overall KYC status
# ---------------------------------------------------------------------------

def compute_overall_kyc_status(applicant: "Applicant") -> str:
    """
    Derive overall KYC status from the 8 section statuses.

    Priority order:
      INCOMPLETE > REJECTED > REVISION_REQUESTED > IN_REVIEW > APPROVED
    """
    section_data = [_get_section_status(applicant, s) for s in KYC_SECTIONS]
    statuses = [d["status"] for d in section_data]

    if any(s == "NOT_STARTED" for s in statuses):
        return "INCOMPLETE"
    if any(s == "REJECTED" for s in statuses):
        return "REJECTED"
    if any(s == "REVISION_REQUESTED" for s in statuses):
        return "REVISION_REQUESTED"
    if all(s == "APPROVED" for s in statuses):
        return "APPROVED"
    return "IN_REVIEW"


# ---------------------------------------------------------------------------
# Full KYC summary (used by both admin and applicant status endpoints)
# ---------------------------------------------------------------------------

def build_kyc_summary(applicant: "Applicant") -> dict:
    """
    Return a complete KYC summary dict including per-section breakdown,
    overall status, completion percentage, and last activity timestamp.
    """
    sections = [_get_section_status(applicant, s) for s in KYC_SECTIONS]
    overall = compute_overall_kyc_status(applicant)

    completed = sum(1 for s in sections if s["status"] not in ("NOT_STARTED", "PENDING"))
    pct = round((completed / len(KYC_SECTIONS)) * 100)

    submitted_timestamps = [s["submitted_at"] for s in sections if s["submitted_at"]]
    last_activity = max(submitted_timestamps) if submitted_timestamps else None

    return {
        "overall_status": overall,
        "completion_percentage": pct,
        "sections": sections,
        "last_activity": last_activity,
    }

from rest_framework.permissions import BasePermission
from rest_framework.request import Request


class IsAdminOrHR(BasePermission):
    """
    Grants access to authenticated staff users (ADMIN or HR role).
    HR users cannot perform destructive operations — enforce that at the view level.
    """

    message = "You must be an Admin or HR staff member to perform this action."

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role in ("ADMIN", "HR")
        )


class IsAdminOnly(BasePermission):
    """Grants access only to ADMIN role users."""

    message = "Only Admin users can perform this action."

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role == "ADMIN"
        )


class IsApplicantOwner(BasePermission):
    """
    Grants access to an authenticated Applicant, but only to their own records.
    Object-level check compares the object's applicant FK to the session applicant.
    """

    message = "You do not have permission to access this resource."

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_applicant", False)
        )

    def has_object_permission(self, request: Request, view, obj) -> bool:
        # obj may be an Applicant or a document with .applicant FK
        applicant = getattr(obj, "applicant", obj)
        return str(applicant.pk) == str(request.user.applicant_id)

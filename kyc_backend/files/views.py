"""
Secure file serving endpoint.

GET /api/files/<token>/

1. Verifies the signed token (expiry + integrity).
2. Checks that the requester is authorised to access this file:
   - Admin/HR staff → any file
   - Applicant      → only their own files (applicant_id in token must match session)
3. Returns a pre-signed S3 redirect in production, or streams the file in dev.
"""
from __future__ import annotations

import mimetypes
import os

from django.conf import settings
from django.http import FileResponse, HttpResponseRedirect
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .utils import verify_file_token


class SecureFileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, file_token: str) -> Response:
        # 1. Verify token
        payload = verify_file_token(file_token)
        if payload is None:
            return Response(
                {"detail": "File token is invalid or has expired."},
                status=status.HTTP_403_FORBIDDEN,
            )

        file_path: str = payload["path"]
        token_applicant_id: str = payload["aid"]

        # 2. Authorisation check
        user = request.user
        is_staff = hasattr(user, "role")  # staff users have a role attribute
        is_applicant = getattr(user, "is_applicant", False)

        if is_applicant:
            if str(user.applicant_id) != token_applicant_id:
                return Response(
                    {"detail": "You are not authorised to access this file."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif not is_staff:
            return Response(
                {"detail": "Authentication credentials were not provided or are insufficient."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 3. Serve the file
        return self._serve_file(request, file_path)

    # ------------------------------------------------------------------

    def _serve_file(self, request: Request, file_path: str):
        """
        Production: redirect to a fresh pre-signed S3 URL.
        Development: stream the file directly from MEDIA_ROOT.
        """
        use_s3 = getattr(settings, "DEFAULT_FILE_STORAGE", "").endswith("PrivateS3Boto3Storage")

        if use_s3:
            from files.storage import PrivateS3Boto3Storage
            storage = PrivateS3Boto3Storage()
            try:
                presigned_url = storage.url(file_path)
            except Exception:
                return Response(
                    {"detail": "Could not generate a download URL. Please try again."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return HttpResponseRedirect(presigned_url)

        # Dev: stream from local filesystem
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        if not os.path.exists(full_path):
            return Response({"detail": "File not found."}, status=status.HTTP_404_NOT_FOUND)

        content_type, _ = mimetypes.guess_type(full_path)
        content_type = content_type or "application/octet-stream"
        file_handle = open(full_path, "rb")
        response = FileResponse(file_handle, content_type=content_type)
        response["Content-Disposition"] = f'inline; filename="{os.path.basename(full_path)}"'
        return response

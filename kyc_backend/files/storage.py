"""
Storage backends for KYC file uploads.

Production:  PrivateS3Boto3Storage — all files stored in a private S3 bucket.
             Pre-signed URLs are generated on demand, never permanently public.
Development: Default FileSystemStorage with media/private/ prefix.
"""
from django.conf import settings


# Only import storages if boto3/django-storages are available
try:
    from storages.backends.s3boto3 import S3Boto3Storage

    class PrivateS3Boto3Storage(S3Boto3Storage):
        """
        S3 storage with private ACL and pre-signed URL generation.
        Files are never publicly accessible — URLs expire after FILE_URL_EXPIRY_SECONDS.
        """
        default_acl = "private"
        file_overwrite = False
        custom_domain = None  # Force pre-signed URLs, never public CDN
        querystring_auth = True
        querystring_expire = getattr(settings, "FILE_URL_EXPIRY_SECONDS", 3600)

        def url(self, name, parameters=None, expire=None, http_method=None):
            expire = expire or self.querystring_expire
            return super().url(name, parameters=parameters, expire=expire, http_method=http_method)

except ImportError:
    # Development fallback — django-storages not installed
    PrivateS3Boto3Storage = None  # type: ignore

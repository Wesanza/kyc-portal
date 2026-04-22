"""
Development settings — extends base.py.
Uses SQLite, console email backend, and debug toolbar.
"""

from .base import *  # noqa: F401, F403

DEBUG = True

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": config("DB_NAME", default="kyc_portal_dev"),  # noqa: F405
#         "USER": config("DB_USER", default="postgres"),  # noqa: F405
#         "PASSWORD": config("DB_PASSWORD", default=""),  # noqa: F405
#         "HOST": config("DB_HOST", default="localhost"),  # noqa: F405
#         "PORT": config("DB_PORT", default="5432"),  # noqa: F405
#     }
# }

# Override to SQLite for zero-config local dev if DB_USE_SQLITE is set
import os
# if os.environ.get("DB_USE_SQLITE"):
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

# Console email for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# CORS — allow local Vite dev server
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Debug toolbar
INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
MIDDLEWARE.insert(1, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa: F405
INTERNAL_IPS = ["127.0.0.1"]

# Local file storage for dev
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

# Relax password rules for dev
AUTH_PASSWORD_VALIDATORS = []

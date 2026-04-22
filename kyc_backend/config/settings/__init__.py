from decouple import config

env = config("DJANGO_ENV", default="dev")

if env == "prod":
    from .prod import *  # noqa
else:
    from .dev import *  # noqa

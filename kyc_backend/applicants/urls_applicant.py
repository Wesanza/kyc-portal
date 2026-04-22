from django.urls import path
from .views import InviteValidateView

urlpatterns = [
    path("invite/<str:token>/validate/", InviteValidateView.as_view(), name="invite-validate"),
]

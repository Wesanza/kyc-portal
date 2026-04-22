from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.permissions import IsAdminOrHR
from .models import NotificationPreferences, InviteSettings
from .serializers import (
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    NotificationPreferencesSerializer,
    InviteSettingsSerializer,
)

from .serializers import LoginSerializer, UserSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"detail": "Token is invalid or already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            access = str(token.access_token)
        except TokenError as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({"access": access}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        return Response(UserSerializer(request.user).data)

    def patch(self, request: Request) -> Response:
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password updated successfully."})


class NotificationPreferencesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrHR]

    def _get_or_create_prefs(self, user) -> NotificationPreferences:
        prefs, _ = NotificationPreferences.objects.get_or_create(user=user)
        return prefs

    def get(self, request: Request) -> Response:
        prefs = self._get_or_create_prefs(request.user)
        return Response(NotificationPreferencesSerializer(prefs).data)

    def patch(self, request: Request) -> Response:
        prefs = self._get_or_create_prefs(request.user)
        serializer = NotificationPreferencesSerializer(
            prefs, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class InviteSettingsView(APIView):
    """Singleton invite config — only ADMINs may write."""
    permission_classes = [IsAdminOrHR]

    def get(self, request: Request) -> Response:
        settings_obj = InviteSettings.get_solo()
        return Response(InviteSettingsSerializer(settings_obj).data)

    def patch(self, request: Request) -> Response:
        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Only Admins can modify invite settings."},
                status=status.HTTP_403_FORBIDDEN,
            )
        settings_obj = InviteSettings.get_solo()
        serializer = InviteSettingsSerializer(
            settings_obj, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
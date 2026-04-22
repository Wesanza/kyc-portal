from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrHR, IsApplicantOwner
from .models import Notification
from .serializers import NotificationSerializer


class BaseNotificationListView(APIView):
    """Shared base — subclasses specify recipient_type and permission."""
    recipient_type: str = ""

    def _get_recipient_id(self, request) -> str:
        raise NotImplementedError

    def get(self, request):
        recipient_id = self._get_recipient_id(request)
        notifications = (
            Notification.objects
            .filter(recipient_type=self.recipient_type, recipient_id=recipient_id)
            .order_by("-created_at")
        )
        unread_count = notifications.filter(is_read=False).count()
        serializer = NotificationSerializer(notifications[:50], many=True)
        return Response({
            "count": notifications.count(),
            "unread_count": unread_count,
            "results": serializer.data,
        })


class BaseMarkReadView(APIView):
    """Mark a single notification as read."""
    recipient_type: str = ""

    def _get_recipient_id(self, request) -> str:
        raise NotImplementedError

    def patch(self, request, notification_id):
        recipient_id = self._get_recipient_id(request)
        try:
            notification = Notification.objects.get(
                pk=notification_id,
                recipient_type=self.recipient_type,
                recipient_id=recipient_id,
            )
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"detail": "Marked as read."})


class BaseMarkAllReadView(APIView):
    """Mark all notifications as read for the recipient."""
    recipient_type: str = ""

    def _get_recipient_id(self, request) -> str:
        raise NotImplementedError

    def post(self, request):
        recipient_id = self._get_recipient_id(request)
        updated = Notification.objects.filter(
            recipient_type=self.recipient_type,
            recipient_id=recipient_id,
            is_read=False,
        ).update(is_read=True)
        return Response({"detail": f"{updated} notification(s) marked as read."})


# ---------------------------------------------------------------------------
# Admin notification views
# ---------------------------------------------------------------------------

class AdminNotificationListView(BaseNotificationListView):
    permission_classes = [IsAdminOrHR]
    recipient_type = "ADMIN"

    def _get_recipient_id(self, request) -> str:
        return str(request.user.pk)


class AdminMarkReadView(BaseMarkReadView):
    permission_classes = [IsAdminOrHR]
    recipient_type = "ADMIN"

    def _get_recipient_id(self, request) -> str:
        return str(request.user.pk)


class AdminMarkAllReadView(BaseMarkAllReadView):
    permission_classes = [IsAdminOrHR]
    recipient_type = "ADMIN"

    def _get_recipient_id(self, request) -> str:
        return str(request.user.pk)


# ---------------------------------------------------------------------------
# Applicant notification views
# ---------------------------------------------------------------------------

class ApplicantNotificationListView(BaseNotificationListView):
    permission_classes = [IsApplicantOwner]
    recipient_type = "APPLICANT"

    def _get_recipient_id(self, request) -> str:
        return str(request.user.applicant_id)


class ApplicantMarkReadView(BaseMarkReadView):
    permission_classes = [IsApplicantOwner]
    recipient_type = "APPLICANT"

    def _get_recipient_id(self, request) -> str:
        return str(request.user.applicant_id)


class ApplicantMarkAllReadView(BaseMarkAllReadView):
    permission_classes = [IsApplicantOwner]
    recipient_type = "APPLICANT"

    def _get_recipient_id(self, request) -> str:
        return str(request.user.applicant_id)

from rest_framework import viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from nkombo_backend.permissions import IsStaffOrReadOnly

from .models import Holiday, HolidayResource
from .serializers import HolidayResourceSerializer, HolidaySerializer


class HolidayViewSet(viewsets.ModelViewSet):
    """School holiday periods (public calendar)."""

    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    filterset_fields = ["is_national"]


class HolidayResourceViewSet(viewsets.ModelViewSet):
    """Revision material. Everyone may download, only staff may publish."""

    queryset = HolidayResource.objects.select_related("uploaded_by").filter(is_active=True)
    serializer_class = HolidayResourceSerializer
    permission_classes = [IsStaffOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ["class_level", "year", "term", "resource_type"]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = HolidayResource.objects.select_related("uploaded_by")
        # Staff also see unpublished material
        user = self.request.user
        if not (user.is_authenticated and (user.is_staff or getattr(user, "role", "") in
                {"admin", "teacher", "dos", "headmaster"})):
            queryset = queryset.filter(is_active=True)
        return queryset

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

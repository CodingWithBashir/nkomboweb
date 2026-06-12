from rest_framework import viewsets, permissions, mixins
from .models import ContactInfo, ContactMessage
from .serializers import (
    ContactInfoSerializer,
    ContactMessageSerializer,
    ContactMessagePublicSerializer,
)


class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer


class ContactMessageViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    filterset_fields = ["is_read"]
    search_fields = ["name", "email", "subject"]


class ContactMessagePublicViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessagePublicSerializer
    permission_classes = [permissions.AllowAny]

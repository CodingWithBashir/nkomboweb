from rest_framework import viewsets, permissions
from nkombo_backend.permissions import IsStaffUser
from .models import Admission
from .serializers import AdmissionSerializer, AdmissionPublicSerializer


class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all()
    serializer_class = AdmissionSerializer
    permission_classes = [IsStaffUser]
    filterset_fields = ["status", "program_applied", "gender"]
    search_fields = ["first_name", "last_name", "parent_name"]

    def get_serializer_class(self):
        if self.action in ["create"]:
            return AdmissionPublicSerializer
        return AdmissionSerializer


class AdmissionPublicViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all()
    serializer_class = AdmissionPublicSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ["post"]

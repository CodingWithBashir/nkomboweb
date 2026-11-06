from rest_framework import serializers
from .models import Admission


class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = "__all__"
        read_only_fields = ["application_date"]


class AdmissionPublicSerializer(serializers.ModelSerializer):
    """Serializer for the public online application form."""

    class Meta:
        model = Admission
        fields = [
            "first_name", "last_name", "date_of_birth", "gender", "level",
            "email", "phone", "program_applied", "parent_name",
            "parent_phone", "parent_email", "address", "previous_school",
            "documents",
        ]
        extra_kwargs = {
            "gender": {"required": False},
            "level": {"required": False},
            "email": {"required": False},
            "phone": {"required": False},
            "program_applied": {"required": False, "allow_null": True},
            "parent_name": {"required": False},
            "parent_phone": {"required": False},
            "parent_email": {"required": False},
            "address": {"required": False},
            "previous_school": {"required": False},
            "documents": {"required": False},
        }

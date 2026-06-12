from rest_framework import serializers
from .models import Admission


class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = "__all__"
        read_only_fields = ["application_date"]


class AdmissionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = [
            "first_name", "last_name", "date_of_birth", "gender",
            "program_applied", "parent_name", "parent_phone",
            "parent_email", "address", "previous_school", "documents",
        ]

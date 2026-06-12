from rest_framework import serializers
from .models import CampusEvent, Facility, Club


class CampusEventSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()

    class Meta:
        model = CampusEvent
        fields = "__all__"


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = "__all__"


class ClubSerializer(serializers.ModelSerializer):
    advisor = serializers.StringRelatedField()

    class Meta:
        model = Club
        fields = "__all__"

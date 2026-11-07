from rest_framework import serializers
from .models import Holiday, HolidayResource


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = "__all__"


class HolidayResourceSerializer(serializers.ModelSerializer):
    class_level_detail = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    academic_year = serializers.ReadOnlyField()
    term_display = serializers.ReadOnlyField()

    class Meta:
        model = HolidayResource
        fields = "__all__"
        read_only_fields = ["file_size", "uploaded_by", "upload_date"]

    def get_class_level_detail(self, obj):
        return {"name": obj.class_level, "level_name": obj.get_class_level_display()}

    def get_uploaded_by_name(self, obj):
        if not obj.uploaded_by:
            return ""
        return obj.uploaded_by.get_full_name() or obj.uploaded_by.username

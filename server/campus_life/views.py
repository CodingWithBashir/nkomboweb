from rest_framework import viewsets
from .models import CampusEvent, Facility, Club
from .serializers import CampusEventSerializer, FacilitySerializer, ClubSerializer


class CampusEventViewSet(viewsets.ModelViewSet):
    queryset = CampusEvent.objects.select_related("created_by").all()
    serializer_class = CampusEventSerializer
    filterset_fields = ["event_type"]
    search_fields = ["title", "description"]


class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    search_fields = ["name"]


class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.select_related("advisor").all()
    serializer_class = ClubSerializer
    search_fields = ["name"]

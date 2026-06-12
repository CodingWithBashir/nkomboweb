from django.contrib import admin
from .models import CampusEvent, Facility, Club

@admin.register(CampusEvent)
class CampusEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'event_date']

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ['name', 'capacity']

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ['name', 'advisor', 'meeting_schedule']

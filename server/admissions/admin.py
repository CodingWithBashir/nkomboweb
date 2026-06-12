from django.contrib import admin
from .models import Admission

@admin.register(Admission)
class AdmissionAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'program_applied', 'status', 'application_date']
    list_filter = ['status']

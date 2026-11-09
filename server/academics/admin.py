from django.contrib import admin

from .models import Department, Grade, Program, Student, Subject, Teacher, Trade


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "head"]


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ["name", "department", "level"]


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "tagline", "is_active", "order"]
    list_filter = ["is_active"]
    search_fields = ["program__name", "code"]
    prepopulated_fields = {"slug": ("code",)}


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "department", "credits"]


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["user", "student_id", "program", "gender", "is_active"]


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ["user", "title", "trade", "is_hod", "qualification", "is_public"]
    list_filter = ["is_hod", "is_public", "trade", "department"]
    search_fields = ["user__first_name", "user__last_name", "employee_id", "qualification"]
    autocomplete_fields = []


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ["student", "subject", "score", "term", "academic_year"]

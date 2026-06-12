from rest_framework import viewsets, permissions
from .models import Department, Program, Subject, Student, Teacher, Grade
from .serializers import (
    DepartmentSerializer,
    ProgramSerializer,
    SubjectSerializer,
    StudentSerializer,
    TeacherSerializer,
    GradeSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.select_related("department").all()
    serializer_class = ProgramSerializer
    filterset_fields = ["department", "level"]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.select_related("department", "program").all()
    serializer_class = SubjectSerializer
    filterset_fields = ["department", "program"]
    search_fields = ["name", "code"]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related("user", "program").all()
    serializer_class = StudentSerializer
    filterset_fields = ["program", "is_active", "gender"]
    search_fields = ["user__first_name", "user__last_name", "student_id"]


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related("user", "department").all()
    serializer_class = TeacherSerializer
    filterset_fields = ["department"]


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.select_related("student", "subject", "teacher").all()
    serializer_class = GradeSerializer
    filterset_fields = ["student", "subject", "term", "academic_year"]

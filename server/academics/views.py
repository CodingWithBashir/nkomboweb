from decimal import Decimal

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from nkombo_backend.permissions import IsStaffUser

from .models import Attendance, Department, Grade, Program, Student, Subject, Teacher
from .serializers import (
    AttendanceSerializer,
    DepartmentSerializer,
    GradeSerializer,
    ProgramSerializer,
    StudentSerializer,
    SubjectSerializer,
    TeacherSerializer,
)


def _current_student(user):
    return getattr(user, "student_profile", None)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.select_related("department").all()
    serializer_class = ProgramSerializer
    filterset_fields = ["department", "level"]
    search_fields = ["name", "description"]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.select_related("department", "program").all()
    serializer_class = SubjectSerializer
    filterset_fields = ["department", "program"]
    search_fields = ["name", "code"]


class StudentViewSet(viewsets.ModelViewSet):
    """Staff can manage students; a student can read only their own profile."""

    queryset = Student.objects.select_related("user", "program").all()
    serializer_class = StudentSerializer
    filterset_fields = ["program", "is_active", "gender"]
    search_fields = ["user__first_name", "user__last_name", "student_id"]

    def get_permissions(self):
        if self.action in {"me"}:
            return [permissions.IsAuthenticated()]
        return [IsStaffUser()]

    @action(detail=False, methods=["get"])
    def me(self, request):
        student = _current_student(request.user)
        if student is None:
            return Response(
                {"detail": "This account has no student profile."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(self.get_serializer(student).data)


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related("user", "department").all()
    serializer_class = TeacherSerializer
    filterset_fields = ["department"]
    permission_classes = [IsStaffUser]


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.select_related("student__user", "subject", "teacher").all()
    serializer_class = GradeSerializer
    filterset_fields = ["student", "subject", "term", "academic_year"]

    def get_permissions(self):
        if self.action in {"mine"}:
            return [permissions.IsAuthenticated()]
        return [IsStaffUser()]

    def perform_create(self, serializer):
        teacher = getattr(self.request.user, "teacher_profile", None)
        serializer.save(teacher=teacher)

    @action(detail=False, methods=["get"])
    def mine(self, request):
        """Results for the signed-in student, newest term first, with an average."""
        student = _current_student(request.user)
        if student is None:
            return Response(
                {"detail": "This account has no student profile."},
                status=status.HTTP_404_NOT_FOUND,
            )

        grades = Grade.objects.filter(student=student).select_related("subject")
        term = request.query_params.get("term")
        year = request.query_params.get("academic_year")
        if term:
            grades = grades.filter(term=term)
        if year:
            grades = grades.filter(academic_year=year)

        data = GradeSerializer(grades, many=True).data

        percentages = [
            float(g.score) / float(g.max_score) * 100
            for g in grades
            if g.max_score
        ]
        average = round(sum(percentages) / len(percentages), 1) if percentages else None

        return Response(
            {
                "student": {
                    "id": student.id,
                    "student_id": student.student_id,
                    "full_name": student.user.get_full_name(),
                    "program": student.program.name,
                    "level": student.program.level,
                },
                "results": data,
                "average": average,
                "count": len(data),
            }
        )


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("student__user", "subject").all()
    serializer_class = AttendanceSerializer
    filterset_fields = ["student", "status", "date", "subject"]

    def get_permissions(self):
        if self.action in {"mine"}:
            return [permissions.IsAuthenticated()]
        return [IsStaffUser()]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=False, methods=["get"])
    def mine(self, request):
        student = _current_student(request.user)
        if student is None:
            return Response(
                {"detail": "This account has no student profile."},
                status=status.HTTP_404_NOT_FOUND,
            )

        records = Attendance.objects.filter(student=student)
        counts = {"present": 0, "absent": 0, "late": 0, "excused": 0}
        for record in records:
            counts[record.status] = counts.get(record.status, 0) + 1

        total = sum(counts.values())
        attendance_rate = (
            round((counts["present"] + counts["late"]) / total * 100, 1) if total else None
        )

        return Response(
            {
                "counts": counts,
                "total": total,
                "attendance_rate": attendance_rate,
                "records": AttendanceSerializer(records[:30], many=True).data,
            }
        )

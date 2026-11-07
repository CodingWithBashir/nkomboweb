from rest_framework import serializers
from .models import (
    Attendance,
    Department,
    Grade,
    Program,
    Student,
    Subject,
    Teacher,
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class ProgramSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True
    )

    class Meta:
        model = Program
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    program = ProgramSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True
    )
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), source="program", write_only=True
    )

    class Meta:
        model = Subject
        fields = "__all__"


class StudentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=Student._meta.get_field("user").related_model.objects.all(),
        source="user",
        write_only=True,
    )
    program = ProgramSerializer(read_only=True)
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), source="program", write_only=True
    )
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class TeacherSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = Teacher
        fields = "__all__"


class GradeSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source="student", write_only=True
    )
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source="subject", write_only=True
    )

    class Meta:
        model = Grade
        fields = "__all__"
        read_only_fields = ["teacher"]

    def validate(self, attrs):
        max_score = attrs.get("max_score", getattr(self.instance, "max_score", 100))
        score = attrs.get("score", getattr(self.instance, "score", None))
        if score is not None and max_score and score > max_score:
            raise serializers.ValidationError(
                {"score": "Score cannot be greater than the maximum score."}
            )
        return attrs


class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source="student", write_only=True
    )
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source="subject",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ["recorded_by"]
        # The model's unique_together includes `subject`, which is optional here
        # (a whole-day register has no subject). Uniqueness is still enforced by
        # the database for records that do have a subject.
        validators = []

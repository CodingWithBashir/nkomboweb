from django.contrib.auth import get_user_model
from django.utils.text import slugify
from rest_framework import serializers

from .models import (
    Attendance,
    Department,
    Grade,
    Program,
    Student,
    Subject,
    Teacher,
    Trade,
)

User = get_user_model()


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


class TradeSummarySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="program.name", read_only=True)

    class Meta:
        model = Trade
        fields = ["id", "slug", "code", "name", "tagline"]


class TeacherSerializer(serializers.ModelSerializer):
    """Public teacher profile, plus the write-only fields the admin form uses."""

    user = serializers.StringRelatedField(read_only=True)
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    initials = serializers.SerializerMethodField()
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True,
        required=False,
    )
    trade = TradeSummarySerializer(read_only=True)
    trade_id = serializers.PrimaryKeyRelatedField(
        queryset=Trade.objects.all(),
        source="trade",
        write_only=True,
        required=False,
        allow_null=True,
    )
    photo_url = serializers.SerializerMethodField()
    # used when an administrator creates or renames a teacher
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = Teacher
        fields = [
            "id",
            "user",
            "full_name",
            "initials",
            "name",
            "email",
            "phone",
            "employee_id",
            "title",
            "is_hod",
            "slug",
            "qualification",
            "hire_date",
            "bio",
            "levels",
            "classes",
            "years_experience",
            "photo",
            "photo_url",
            "is_public",
            "order",
            "department",
            "department_id",
            "trade",
            "trade_id",
            "password",
        ]
        read_only_fields = ["slug"]
        extra_kwargs = {"employee_id": {"required": False}}

    def get_initials(self, obj):
        names = obj.full_name.split()
        return "".join(part[0] for part in names[:2]).upper() or "T"

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get("request")
        url = obj.photo.url
        return request.build_absolute_uri(url) if request else url

    # -- write helpers ---------------------------------------------------
    def _split_name(self, name):
        parts = name.strip().split()
        if not parts:
            return "", ""
        if len(parts) == 1:
            return parts[0], ""
        return parts[0], " ".join(parts[1:])

    def create(self, validated_data):
        name = validated_data.pop("name", "") or ""
        password = validated_data.pop("password", "") or "teacher123"
        email = validated_data.get("email", "") or ""
        department = validated_data.get("department")
        if department is None:
            # fall back to the department that owns the trade
            trade = validated_data.get("trade")
            if trade is not None:
                department = trade.program.department
                validated_data["department"] = department
        if department is None:
            raise serializers.ValidationError(
                {"department_id": "A department is required."}
            )
        first_name, last_name = self._split_name(name)
        base = slugify(f"{first_name}.{last_name}" if last_name else first_name) or "teacher"
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            counter += 1
            username = f"{base}{counter}"
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role="teacher",
        )
        if not validated_data.get("employee_id"):
            validated_data["employee_id"] = f"TCH{user.pk:04d}"
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher

    def update(self, instance, validated_data):
        name = validated_data.pop("name", "") or ""
        password = validated_data.pop("password", "") or ""
        if name:
            first_name, last_name = self._split_name(name)
            instance.user.first_name = first_name
            instance.user.last_name = last_name
        email = validated_data.get("email")
        if email:
            instance.user.email = email
        if password:
            instance.user.set_password(password)
        instance.user.save()
        return super().update(instance, validated_data)


class TradeSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="program.name", read_only=True)
    department = serializers.CharField(source="program.department.name", read_only=True)
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), source="program", write_only=True, required=False
    )
    teachers = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()

    class Meta:
        model = Trade
        fields = [
            "id",
            "slug",
            "code",
            "name",
            "tagline",
            "summary",
            "description",
            "icon",
            "image",
            "entry_requirements",
            "career_paths",
            "curriculum",
            "is_active",
            "order",
            "department",
            "program_id",
            "teachers",
            "teacher_count",
        ]

    def _team(self, obj):
        return [t for t in obj.teachers.all() if t.is_public]

    def get_teachers(self, obj):
        return TeacherSerializer(self._team(obj), many=True, context=self.context).data

    def get_teacher_count(self, obj):
        return len(self._team(obj))


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

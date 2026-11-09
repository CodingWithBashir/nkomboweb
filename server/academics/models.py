from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    head = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="headed_departments",
    )

    class Meta:
        db_table = "academics_department"

    def __str__(self):
        return self.name


class Program(models.Model):
    LEVEL_CHOICES = [
        ("primary", "Primary"),
        ("secondary", "Secondary"),
    ]

    name = models.CharField(max_length=100)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="programs"
    )
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "academics_program"

    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="subjects"
    )
    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="subjects"
    )
    credits = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "academics_subject"

    def __str__(self):
        return f"{self.code} - {self.name}"


class Student(models.Model):
    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
    ]

    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="student_profile"
    )
    student_id = models.CharField(max_length=20, unique=True)
    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="students"
    )
    enrollment_date = models.DateField()
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    parent_name = models.CharField(max_length=200)
    parent_phone = models.CharField(max_length=20)
    address = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "academics_student"

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"


class Trade(models.Model):
    """A TVET trade (SOD, NIT, ...) with its L3-L5 curriculum and teaching team."""

    program = models.OneToOneField(
        Program, on_delete=models.CASCADE, related_name="trade"
    )
    slug = models.SlugField(max_length=80, unique=True)
    code = models.CharField(max_length=8)
    tagline = models.CharField(max_length=160, blank=True)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    # lucide icon key used by the front-end (code, network, video, ...)
    icon = models.CharField(max_length=40, default="code")
    image = models.CharField(max_length=200, blank=True)
    entry_requirements = models.TextField(blank=True)
    career_paths = models.JSONField(default=list, blank=True)
    # [{"level": "L3", "title": "...", "modules": ["...", "..."]}, ...]
    curriculum = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "academics_trade"
        ordering = ["order", "code"]

    def __str__(self):
        return f"{self.code} - {self.program.name}"

    @property
    def name(self):
        return self.program.name


class Teacher(models.Model):
    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="teacher_profile"
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="teachers"
    )
    qualification = models.CharField(max_length=200)
    hire_date = models.DateField(default=timezone.localdate)

    # --- public profile -------------------------------------------------
    trade = models.ForeignKey(
        Trade,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="teachers",
    )
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    title = models.CharField(max_length=80, default="Trainer")
    is_hod = models.BooleanField(
        default=False, help_text="Head of Department for this trade"
    )
    photo = models.ImageField(upload_to="teachers/", blank=True, null=True)
    bio = models.TextField(blank=True)
    levels = models.CharField(max_length=60, blank=True, help_text="e.g. L3, L4, L5")
    classes = models.CharField(
        max_length=160, blank=True, help_text="e.g. L3 SOD-A, L4 SOD-B"
    )
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    is_public = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "academics_teacher"
        ordering = ["-is_hod", "order", "id"]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.user.get_full_name() or self.user.username) or self.employee_id
            slug = base
            counter = 2
            while Teacher.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        if not self.email:
            self.email = self.user.email
        super().save(*args, **kwargs)


class Grade(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="grades"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="grades"
    )
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, related_name="assigned_grades"
    )
    score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    term = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=9)
    date_recorded = models.DateField(auto_now_add=True)

    class Meta:
        db_table = "academics_grade"
        unique_together = ["student", "subject", "term", "academic_year"]

    def __str__(self):
        return f"{self.student} - {self.subject}: {self.score}/{self.max_score}"


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("excused", "Excused"),
    ]

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="attendance"
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="attendance",
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="present")
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="attendance_recorded",
    )

    class Meta:
        db_table = "academics_attendance"
        ordering = ["-date"]
        unique_together = ["student", "subject", "date"]

    def __str__(self):
        return f"{self.student} - {self.date}: {self.get_status_display()}"

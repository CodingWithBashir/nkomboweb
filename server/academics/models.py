from django.db import models


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


class Teacher(models.Model):
    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="teacher_profile"
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="teachers"
    )
    qualification = models.CharField(max_length=200)
    hire_date = models.DateField()

    class Meta:
        db_table = "academics_teacher"

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"


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

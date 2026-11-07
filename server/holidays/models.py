from django.db import models


class Holiday(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True)
    is_national = models.BooleanField(default=False)

    class Meta:
        db_table = "holidays_holiday"
        ordering = ["start_date"]

    def __str__(self):
        return f"{self.name} ({self.start_date} to {self.end_date})"


def _human_size(num_bytes):
    if not num_bytes:
        return ""
    size = float(num_bytes)
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024 or unit == "GB":
            return f"{size:.0f} {unit}" if unit == "B" else f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} GB"


class HolidayResource(models.Model):
    """Teaching material (assignment, revision notes, study guide) for a class."""

    CLASS_LEVEL_CHOICES = [
        ("L3", "L3"),
        ("L4", "L4"),
        ("L5", "L5"),
    ]
    TERM_CHOICES = [
        (1, "Term 1"),
        (2, "Term 2"),
        (3, "Term 3"),
    ]
    RESOURCE_TYPE_CHOICES = [
        ("assignment", "Holiday Assignment"),
        ("revision", "Revision Notes"),
        ("guide", "Study Guide"),
        ("past_paper", "Past Paper"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    class_level = models.CharField(max_length=2, choices=CLASS_LEVEL_CHOICES, default="L3")
    year = models.PositiveIntegerField(help_text="Start year, e.g. 2024 for the 2024-2025 year")
    term = models.PositiveSmallIntegerField(choices=TERM_CHOICES, default=1)
    resource_type = models.CharField(
        max_length=20, choices=RESOURCE_TYPE_CHOICES, default="assignment"
    )
    file = models.FileField(upload_to="holiday_resources/", blank=True, null=True)
    file_size = models.CharField(max_length=20, blank=True)
    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="holiday_resources",
    )
    is_active = models.BooleanField(default=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "holidays_holidayresource"
        ordering = ["-upload_date"]

    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            self.file_size = _human_size(self.file.size)
        super().save(*args, **kwargs)

    @property
    def academic_year(self):
        return f"{self.year} – {self.year + 1}"

    @property
    def term_display(self):
        return f"Term {self.term}"

    def __str__(self):
        return f"{self.title} ({self.class_level})"

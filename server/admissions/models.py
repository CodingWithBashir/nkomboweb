from django.db import models


class Admission(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("waitlisted", "Waitlisted"),
    ]

    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
    ]

    LEVEL_CHOICES = [
        ("olevel", "O-Level"),
        ("alevel", "A-Level"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    # Optional so the public online form can be submitted without a program choice
    program_applied = models.ForeignKey(
        "academics.Program",
        on_delete=models.CASCADE,
        related_name="admissions",
        blank=True,
        null=True,
    )
    parent_name = models.CharField(max_length=200, blank=True)
    parent_phone = models.CharField(max_length=20, blank=True)
    parent_email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    previous_school = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    application_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    documents = models.FileField(upload_to="admissions/documents/", blank=True, null=True)

    class Meta:
        db_table = "admissions_admission"
        ordering = ["-application_date"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.get_status_display()}"

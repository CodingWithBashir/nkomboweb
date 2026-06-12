from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Administrator"),
        ("teacher", "Teacher"),
        ("student", "Student"),
        ("parent", "Parent"),
        ("dos", "Director of Studies"),
        ("headmaster", "Headmaster"),
    ]

    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default="student")
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)

    groups = models.ManyToManyField(
        "auth.Group",
        verbose_name="groups",
        blank=True,
        related_name="nkombo_users",
        related_query_name="nkombo_user",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        verbose_name="user permissions",
        blank=True,
        related_name="nkombo_users",
        related_query_name="nkombo_user",
    )

    objects = UserManager()

    class Meta:
        db_table = "accounts_user"
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

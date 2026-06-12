from django.db import models


class CampusEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ("sports", "Sports"),
        ("cultural", "Cultural"),
        ("academic", "Academic"),
        ("social", "Social"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateField()
    event_type = models.CharField(max_length=10, choices=EVENT_TYPE_CHOICES)
    image = models.ImageField(upload_to="campus_events/", blank=True, null=True)
    created_by = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="campus_events"
    )

    class Meta:
        db_table = "campus_life_event"
        ordering = ["-event_date"]

    def __str__(self):
        return f"{self.title} ({self.event_date})"


class Facility(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="facilities/", blank=True, null=True)
    capacity = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        db_table = "campus_life_facility"

    def __str__(self):
        return self.name


class Club(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    advisor = models.ForeignKey(
        "academics.Teacher",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clubs",
    )
    meeting_schedule = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = "campus_life_club"

    def __str__(self):
        return self.name

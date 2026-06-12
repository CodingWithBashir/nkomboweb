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

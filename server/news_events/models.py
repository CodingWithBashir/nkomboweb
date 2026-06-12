from django.db import models
from django.utils.text import slugify


class NewsArticle(models.Model):
    CATEGORY_CHOICES = [
        ("news", "News"),
        ("announcement", "Announcement"),
        ("achievement", "Achievement"),
        ("event", "Event"),
    ]

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)
    image = models.ImageField(upload_to="news/", blank=True, null=True)
    author = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="articles"
    )
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES, default="news")
    is_published = models.BooleanField(default=False)
    published_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "news_events_article"
        ordering = ["-published_date"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.excerpt and self.content:
            self.excerpt = self.content[:497] + "..."
        super().save(*args, **kwargs)

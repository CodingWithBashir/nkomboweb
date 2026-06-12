from rest_framework import serializers
from .models import NewsArticle


class NewsArticleSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = NewsArticle
        fields = "__all__"
        read_only_fields = ["slug", "created_at", "updated_at"]


class NewsArticleListSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = NewsArticle
        fields = [
            "id", "title", "slug", "excerpt", "image", "author",
            "category", "is_published", "published_date",
        ]

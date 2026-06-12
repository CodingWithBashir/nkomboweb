from rest_framework import viewsets, permissions
from .models import NewsArticle
from .serializers import NewsArticleSerializer, NewsArticleListSerializer


class NewsArticleViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.select_related("author").all()
    serializer_class = NewsArticleSerializer
    filterset_fields = ["category", "is_published"]
    search_fields = ["title", "content"]
    ordering_fields = ["published_date", "created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return NewsArticleListSerializer
        return NewsArticleSerializer


class PublishedNewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NewsArticle.objects.filter(is_published=True).select_related("author")
    serializer_class = NewsArticleListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["category"]
    search_fields = ["title", "content"]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"news", views.NewsArticleViewSet)
router.register(r"news/published", views.PublishedNewsViewSet, basename="published-news")

urlpatterns = [
    path("", include(router.urls)),
]

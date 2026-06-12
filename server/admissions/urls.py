from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"admissions", views.AdmissionViewSet)
router.register(r"admissions/apply", views.AdmissionPublicViewSet, basename="admission-apply")

urlpatterns = [
    path("", include(router.urls)),
]

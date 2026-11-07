from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"holidays", views.HolidayViewSet, basename="holiday")
router.register(r"holiday-resources", views.HolidayResourceViewSet, basename="holiday-resource")

urlpatterns = [
    path("", include(router.urls)),
]

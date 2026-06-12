from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"campus-events", views.CampusEventViewSet)
router.register(r"facilities", views.FacilityViewSet)
router.register(r"clubs", views.ClubViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

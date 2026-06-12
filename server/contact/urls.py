from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"contact-info", views.ContactInfoViewSet)
router.register(r"contact-messages", views.ContactMessageViewSet)
router.register(r"contact/submit", views.ContactMessagePublicViewSet, basename="contact-submit")

urlpatterns = [
    path("", include(router.urls)),
]

from django.urls import path
from . import views

# Mounted at /api/contact/ by nkombo_backend/urls.py.
urlpatterns = [
    # Public contact form (frontend POSTs here)
    path(
        "messages/",
        views.ContactMessagePublicViewSet.as_view({"post": "create"}),
        name="contact-message-create",
    ),
    # Staff inbox
    path(
        "inbox/",
        views.ContactMessageViewSet.as_view({"get": "list"}),
        name="contact-inbox",
    ),
    path(
        "inbox/<int:pk>/",
        views.ContactMessageViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update"}
        ),
        name="contact-inbox-detail",
    ),
    # School contact details
    path(
        "info/",
        views.ContactInfoViewSet.as_view({"get": "list", "post": "create"}),
        name="contact-info-list",
    ),
    path(
        "info/<int:pk>/",
        views.ContactInfoViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="contact-info-detail",
    ),
]

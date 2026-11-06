from django.urls import path
from . import views

# Mounted at /api/admissions/ by nkombo_backend/urls.py.
urlpatterns = [
    # Public application form (frontend POSTs here)
    path(
        "applications/",
        views.AdmissionPublicViewSet.as_view({"post": "create"}),
        name="admission-apply",
    ),
    # Staff management of applications
    path(
        "",
        views.AdmissionViewSet.as_view({"get": "list", "post": "create"}),
        name="admission-list",
    ),
    path(
        "<int:pk>/",
        views.AdmissionViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="admission-detail",
    ),
]

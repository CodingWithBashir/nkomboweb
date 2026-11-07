from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response(
        {
            "message": "Lycée de Nyanza API is running",
            "endpoints": {
                "admin": "/admin/",
                "auth": "/api/auth/",
                "academics": "/api/academics/",
                "holidays": "/api/holidays/",
                "holiday_resources": "/api/holiday-resources/",
                "grades": "/api/academics/grades/",
                "attendance": "/api/academics/attendance/",
                "admissions": "/api/admissions/",
                "campus_life": "/api/campus-life/",
                "news": "/api/news/",
                "contact": "/api/contact/",
            },
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def site_root(request):
    """Friendly response for the bare domain (otherwise a 404)."""
    return Response(
        {
            "message": "Lycée de Nyanza API is running",
            "api": request.build_absolute_uri("/api/"),
            "admin": request.build_absolute_uri("/admin/"),
        }
    )


def favicon(request):
    """Browsers request /favicon.ico; answer quietly instead of logging a 404."""
    return HttpResponse(status=204)


urlpatterns = [
    path("", site_root, name="site-root"),
    path("favicon.ico", favicon, name="favicon"),
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api-root"),
    path("api/auth/", include("accounts.urls")),
    path("api/academics/", include("academics.urls")),
    path("api/admissions/", include("admissions.urls")),
    path("api/campus-life/", include("campus_life.urls")),
    path("api/contact/", include("contact.urls")),
    # These routers already use their resource name as prefix ("holidays", "news"),
    # so they are mounted directly under /api/ to avoid doubling the segment.
    path("api/", include("holidays.urls")),
    path("api/", include("news_events.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

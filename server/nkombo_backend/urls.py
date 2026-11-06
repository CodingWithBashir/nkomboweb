from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "message": "Lycée de Nyanza API is running",
        "endpoints": {
            "admin": "/admin/",
            "auth": "/api/auth/",
            "academics": "/api/academics/",
            "holidays": "/api/holidays/",
            "admissions": "/api/admissions/",
            "campus_life": "/api/campus-life/",
            "news": "/api/news/",
            "contact": "/api/contact/",
        }
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api-root"),
    path("api/auth/", include("accounts.urls")),
    path("api/academics/", include("academics.urls")),
    path("api/holidays/", include("holidays.urls")),
    path("api/admissions/", include("admissions.urls")),
    path("api/campus-life/", include("campus_life.urls")),
    path("api/news/", include("news_events.urls")),
    path("api/contact/", include("contact.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

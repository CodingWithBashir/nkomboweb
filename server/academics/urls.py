from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"departments", views.DepartmentViewSet)
router.register(r"programs", views.ProgramViewSet)
router.register(r"subjects", views.SubjectViewSet)
router.register(r"students", views.StudentViewSet)
router.register(r"teachers", views.TeacherViewSet)
router.register(r"grades", views.GradeViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

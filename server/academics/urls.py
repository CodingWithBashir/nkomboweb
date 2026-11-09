from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"departments", views.DepartmentViewSet)
router.register(r"programs", views.ProgramViewSet)
router.register(r"subjects", views.SubjectViewSet)
router.register(r"students", views.StudentViewSet)
router.register(r"teachers", views.TeacherViewSet, basename="teacher")
router.register(r"trades", views.TradeViewSet, basename="trade")
router.register(r"grades", views.GradeViewSet, basename="grade")
router.register(r"attendance", views.AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
]

from django.urls import path
from . import views

# Mounted at /api/auth/ by nkombo_backend/urls.py — keep paths relative to it.
urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("users/", views.UserListView.as_view(), name="user-list"),
]

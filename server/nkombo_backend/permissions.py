"""Shared permission helpers.

The project uses a custom `role` field on the user model (admin, teacher, dos,
headmaster, student, parent) rather than Django's `is_staff` flag, so both are
accepted when deciding whether someone may write to the school's content.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission

STAFF_ROLES = {"admin", "teacher", "dos", "headmaster"}


def is_staff_user(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    return bool(user.is_staff or getattr(user, "role", "") in STAFF_ROLES)


class IsStaffUser(BasePermission):
    """Full access for staff (teachers, DOS, headmaster, admin)."""

    message = "Staff access required."

    def has_permission(self, request, view):
        return is_staff_user(request.user)


class IsStaffOrReadOnly(BasePermission):
    """Anyone may read the school's public content; only staff may change it."""

    message = "Only staff can modify this content."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return is_staff_user(request.user)

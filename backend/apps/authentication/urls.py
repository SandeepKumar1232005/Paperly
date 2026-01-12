from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, FileUploadView, RequestPasswordResetView, ResetPasswordVerifyView

router = DefaultRouter()
# Explicitly register to 'users' to avoid conflict with auth endpoints
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file_upload'),
    path('password-reset-request/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('password-reset-verify/', ResetPasswordVerifyView.as_view(), name='password_reset_verify'),
    path('', include(router.urls)),
]

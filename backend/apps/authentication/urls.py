from django.urls import path
from .views import RegisterView, LoginView, UserDetailsView, RequestPasswordResetView, PasswordResetVerifyView, UserListView, UserManagementView, FileUploadView, GoogleLoginView

urlpatterns = [
    path('', UserListView.as_view(), name='user_list'), # Handles /api/users/
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailsView.as_view(), name='user_details'),
    path('upload/', FileUploadView.as_view(), name='file_upload'),
    path('users/password-reset-request/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('users/password-reset-verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('<str:user_id>/', UserManagementView.as_view(), name='user_management'),
]

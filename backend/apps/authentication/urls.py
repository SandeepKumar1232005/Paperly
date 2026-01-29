from django.urls import path
from .views import RegisterView, LoginView, UserDetailsView, RequestPasswordResetView, PasswordResetVerifyView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailsView.as_view(), name='user_details'),
    path('users/password-reset-request/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('users/password-reset-verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
]

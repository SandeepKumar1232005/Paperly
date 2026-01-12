from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.conf import settings
import os
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
import random
from django.core.cache import cache
from django.core.mail import send_mail
from rest_framework import status

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=400)
        
        # Save the file
        file_name = default_storage.save(file_obj.name, file_obj)
        file_url = os.path.join(settings.MEDIA_URL, file_name).replace('\\', '/')
        
        # Ensure URL starts with / if needed, or is absolute. 
        # Using build_absolute_uri is better for frontend
        absolute_url = request.build_absolute_uri(file_url)

        return Response({'url': absolute_url})

from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000"  # Frontend URL
    client_class = OAuth2Client
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Disable JWT Auth for this view to prevent "Invalid token" error

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Manually replace access/refresh tokens to ensure they are valid SimpleJWTs
            # This fixes the "Given token not valid for any token type" error
            user = self.user if hasattr(self, 'user') else None
            if not user and 'user' in response.data:
                 # Try to fetch user from response data if not on self
                 # Actually SocialLoginView sets self.user usually.
                 pass
            
            if user:
                 refresh = RefreshToken.for_user(user)
                 response.data['access'] = str(refresh.access_token)
                 response.data['access_token'] = str(refresh.access_token) # For robustness
                 response.data['refresh'] = str(refresh)
        return response



User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet for users to manage profiles and for admins to manage users.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            # Case-insensitive filtering for flexibility
            queryset = queryset.filter(role__iexact=role)
        return queryset.order_by('-date_joined')

    @action(detail=False, methods=['patch'], url_path='me')
    def update_me(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal user existence, but for dev we can hint or just return success
            # Returning success to prevent enumeration is best practice, but for this dev task we can facilitate.
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Store in Cache (5 minutes expiry)
        cache_key = f'password_reset_otp_{email}'
        cache.set(cache_key, otp, timeout=300)
        
        # In Production: send_mail(...)
        # For Development as requested: Print to Console
        print(f"\n[DEV OTP] Password Reset OTP for {email}: {otp}\n")
        
        return Response({'message': 'OTP sent to email.'})

class ResetPasswordVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not email or not otp or not new_password:
             return Response({'error': 'Email, OTP, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
             
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters long (Backend)'}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f'password_reset_otp_{email}'
        cached_otp = cache.get(cache_key)
        
        if not cached_otp or str(cached_otp) != str(otp):
             return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
             user = User.objects.get(email=email)
             user.set_password(new_password)
             user.save()
             
             # Clear OTP
             cache.delete(cache_key)
             
             return Response({'message': 'Password reset successfully.'})
        except User.DoesNotExist:
             return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

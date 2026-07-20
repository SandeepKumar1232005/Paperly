from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from database.repositories.users import UserRepository
from database.repositories.password_resets import PasswordResetRepository
from passlib.hash import pbkdf2_sha256
import uuid
import datetime
import jwt
from pathlib import Path

class RegisterView(APIView):
    """
    Register a new user in Supabase PostgreSQL.
    """
    permission_classes = []

    def post(self, request):
        try:
            data = request.data
            email = data.get('email', '').strip()
            if email: email = email.lower()
            password = data.get('password')
            name = data.get('name')
            username = data.get('username', '').strip()
            if username: username = username.lower()
            role = data.get('role', 'STUDENT')
            avatar = data.get('avatar', '') # New field
            address = data.get('address', '') # New field

            print(f"Register attempt: {email}, {username}")

            if not email or not password or not username:
                return Response({'error': 'Email, password, and username required'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists (email OR username)
            existing = UserRepository.check_email_or_username_exists(email, username)
            
            if existing:
                if existing.get('username') == username:
                     return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Hash password
            hashed_password = pbkdf2_sha256.hash(password)

            user_id = str(uuid.uuid4())
            new_user = {
                'id': user_id,
                'email': email,
                'username': username,
                'password': hashed_password,
                'name': name,
                'role': role,
                'avatar': avatar,
                'address': address,
                'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
            }

            UserRepository.create(new_user)
            print("User inserted successfully")
            
            # Generate Token (Simple JWT or custom)
            token_payload = {
                'user_id': user_id,
                'email': email,
                'role': role,
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
            }
            token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')

            # Determine redirect/payload
            return Response({
                'message': 'User created successfully',
                'key': token,
                'user': {
                    'id': user_id,
                    'email': email, 
                    'username': username, 
                    'name': name,
                    'role': role, 
                    'avatar': avatar,
                    'address': address,
                    'is_verified': False,
                    'handwriting_style': None,
                    'handwriting_confidence': None,
                    'handwriting_sample_url': None,
                    'handwriting_samples': [],
                    'qr_code_url': None,
                    'price_per_page': None,
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    authentication_classes = [] # Disable CSRF check
    permission_classes = []

    def post(self, request):
        identifier = request.data.get('email') # Frontend still sends 'email' state, but it can be username
        password = request.data.get('password')

        print(f"Login Attempt: identifier={identifier}")
        
        if not identifier or not password:
             return Response({'error': 'Please provide both username/email and password'}, status=status.HTTP_400_BAD_REQUEST)

        # Find by email OR username
        user = UserRepository.get_by_email_or_username(identifier)
        
        if user:
            print(f"User found: {user.get('email')} (ID: {user.get('id')})")
        else:
            print(f"User NOT found for identifier: {identifier}")

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not pbkdf2_sha256.verify(password, user['password']):
            print("Password verification FAILED")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
        print("Password verification SUCCESS")

        # Generate Token (Simple JWT or custom)
        token_payload = {
            'user_id': user['id'],
            'email': user['email'],
            'role': user.get('role', 'STUDENT'),
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
        }
        token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')

        return Response({
            'key': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user.get('name'),
                'role': user.get('role'),
                'avatar': user.get('avatar'),
                'username': user.get('username'),
                'address': user.get('address'),
                'is_verified': user.get('is_verified', False),
                'handwriting_style': user.get('handwriting_style'),
                'handwriting_confidence': user.get('handwriting_confidence'),
                'handwriting_sample_url': user.get('handwriting_sample_url'),
                'handwriting_samples': user.get('handwriting_samples', []),
                'qr_code_url': user.get('qr_code_url'),
                'price_per_page': user.get('price_per_page'),
            }
        })

class UserDetailsView(APIView):
    authentication_classes = [] 
    permission_classes = []

    def get_user_from_token(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        try:
            # "Bearer <token>" or "Token <token>"
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            
            return UserRepository.get_by_id(user_id)
        except Exception as e:
            print("Token Error:", e)
            return None

    def get(self, request):
        user = self.get_user_from_token(request)
        if not user:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'id': user['id'],
            'username': user.get('username'),
            'email': user['email'],
            'first_name': user.get('name', '').split(' ')[0],
            'last_name': ' '.join(user.get('name', '').split(' ')[1:]),
            'name': user.get('name'),
            'role': user.get('role'),
            'avatar': user.get('avatar'),
            'address': user.get('address'),
            'is_verified': user.get('is_verified', False),
            'handwriting_style': user.get('handwriting_style'),
            'handwriting_confidence': user.get('handwriting_confidence'),
            'handwriting_sample_url': user.get('handwriting_sample_url'),
            'handwriting_samples': user.get('handwriting_samples', []),
            'qr_code_url': user.get('qr_code_url'),
            'price_per_page': user.get('price_per_page'),
            'auth_provider': user.get('auth_provider'),
            'is_custom_profile_picture': user.get('is_custom_profile_picture', False),
        })

    def patch(self, request):
        user = self.get_user_from_token(request)
        if not user:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        updates = request.data
        valid_updates = {}
        
        # Whitelist fields
        if 'name' in updates: valid_updates['name'] = updates['name']
        if 'address' in updates: valid_updates['address'] = updates['address']
        if 'avatar' in updates:
            valid_updates['avatar'] = updates['avatar']
            # Mark as custom profile picture when user explicitly changes avatar
            valid_updates['is_custom_profile_picture'] = True
        if 'is_custom_profile_picture' in updates:
            valid_updates['is_custom_profile_picture'] = bool(updates['is_custom_profile_picture'])
        if 'availability_status' in updates: valid_updates['availability_status'] = updates['availability_status']
        if 'coordinates' in updates: valid_updates['coordinates'] = updates['coordinates']
        if 'handwriting_samples' in updates: valid_updates['handwriting_samples'] = updates['handwriting_samples']
        if 'qr_code_url' in updates: valid_updates['qr_code_url'] = updates['qr_code_url']
        if 'price_per_page' in updates: valid_updates['price_per_page'] = updates['price_per_page']
        if 'handwriting_style' in updates: valid_updates['handwriting_style'] = updates['handwriting_style']
        if 'handwriting_confidence' in updates: valid_updates['handwriting_confidence'] = updates['handwriting_confidence']
        
        if valid_updates:
            UserRepository.update(user['id'], valid_updates)
            
        # Return updated user
        updated_user = UserRepository.get_by_id(user['id']) or user
        
        return Response({
            'id': updated_user['id'],
            'username': updated_user.get('username'),
            'email': updated_user['email'],
             'name': updated_user.get('name'),
            'role': updated_user.get('role'),
            'avatar': updated_user.get('avatar'),
            'address': updated_user.get('address'),
            'is_verified': updated_user.get('is_verified', False),
            'handwriting_style': updated_user.get('handwriting_style'),
            'handwriting_confidence': updated_user.get('handwriting_confidence'),
            'handwriting_sample_url': updated_user.get('handwriting_sample_url'),
            'handwriting_samples': updated_user.get('handwriting_samples', []),
            'qr_code_url': updated_user.get('qr_code_url'),
            'price_per_page': updated_user.get('price_per_page'),
            'auth_provider': updated_user.get('auth_provider'),
            'is_custom_profile_picture': updated_user.get('is_custom_profile_picture', False),
        })

class RequestPasswordResetView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = UserRepository.get_by_email(email)
        if not user:
            return Response({'error': 'User not found with this email'}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        import random
        otp = str(random.randint(100000, 999999))
        
        # Save to DB (password_resets table)
        now = datetime.datetime.now(datetime.timezone.utc)
        expiry = now + datetime.timedelta(minutes=10)
        PasswordResetRepository.create(email, otp, now, expiry)

        # Send Email
        from django.core.mail import send_mail
        try:
            print(f"--- OTP for {email}: {otp} ---")
            send_mail(
                'Password Reset OTP - Paperly',
                f'Your password reset OTP is: {otp}',
                'noreply@paperly.com',
                [email],
                fail_silently=False,
            )
            return Response({'message': 'OTP sent successfully'})
        except Exception as e:
            print(e)
            return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PasswordResetVerifyView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not email or not otp or not new_password:
             return Response({'error': 'Email, OTP, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check OTP
        record = PasswordResetRepository.get_by_email(email)
        if not record:
            return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

        if record['otp'] != otp:
             return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure timezone aware comparison
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = record['expires_at']
        # Handle string timestamps from Supabase
        if isinstance(expires_at, str):
            expires_at = datetime.datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        elif expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
            
        if now > expires_at:
             return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Update Password — find user by email and update
        hashed_password = pbkdf2_sha256.hash(new_password)
        user = UserRepository.get_by_email(email)
        if user:
            UserRepository.update(user['id'], {'password': hashed_password})
        
        # Delete OTP record
        PasswordResetRepository.delete(email)
        
        return Response({'message': 'Password reset successfully!'})

# Helper for distance
import math
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371 # km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

class UserListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        role = request.query_params.get('role')
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        
        users = UserRepository.list_all(role=role)
            
        results = []
        for u in users:
            user_data = {
                'id': u.get('id'),
                'email': u.get('email'),
                'name': u.get('name') or u.get('username'),
                'first_name': None,
                'last_name': None,
                'username': u.get('username'),
                'role': u.get('role'),
                'avatar': u.get('avatar'),
                'address': u.get('address'),
                'is_verified': u.get('is_verified', False),
                'handwriting_style': u.get('handwriting_style'),
                'handwriting_confidence': u.get('handwriting_confidence'),
                'availability_status': u.get('availability_status', 'ONLINE'),
                'handwriting_samples': u.get('handwriting_samples', []),
                'qr_code_url': u.get('qr_code_url'),
                'price_per_page': u.get('price_per_page'),
                'auth_provider': u.get('auth_provider'),
                'is_custom_profile_picture': u.get('is_custom_profile_picture', False),
            }
            
            # Calculate distance if coords provided
            if lat and lon and u.get('coordinates'):
                try:
                    u_lat = u['coordinates']['lat']
                    u_lon = u['coordinates']['lon']
                    dist = calculate_distance(float(lat), float(lon), float(u_lat), float(u_lon))
                    user_data['distance_km'] = round(dist, 1)
                except:
                    pass
            
            results.append(user_data)
            
        if lat and lon:
            # Sort by distance
            results.sort(key=lambda x: x.get('distance_km', float('inf')))

        return Response(results)

class UserManagementView(APIView):
    def delete(self, request, user_id):
        # Prevent self deletion by checking the token
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                request_user_id = payload.get('user_id')
                if request_user_id == user_id:
                    return Response({'error': 'Admins cannot delete their own account'}, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                print("Token parsing error during deletion check:", e)
        
        UserRepository.delete(user_id)
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, user_id):
        # Verify that the requester is an admin
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            request_user_id = payload.get('user_id')
            
            # Fetch requester profile to check role
            req_user = UserRepository.get_by_id(request_user_id)
            if not req_user or req_user.get('role') != 'ADMIN':
                return Response({'error': 'Forbidden - Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        updates = request.data
        valid_updates = {}
        
        # Allow admin to toggle verification
        if 'is_verified' in updates:
            valid_updates['is_verified'] = bool(updates['is_verified'])
            
        if valid_updates:
            UserRepository.update(user_id, valid_updates)
            
        # Return updated user
        updated_user = UserRepository.get_by_id(user_id)
        if not updated_user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({
            'id': updated_user['id'],
            'username': updated_user.get('username'),
            'email': updated_user['email'],
            'name': updated_user.get('name'),
            'role': updated_user.get('role'),
            'avatar': updated_user.get('avatar'),
            'address': updated_user.get('address'),
            'is_verified': updated_user.get('is_verified', False),
            'handwriting_style': updated_user.get('handwriting_style'),
            'handwriting_confidence': updated_user.get('handwriting_confidence'),
            'handwriting_sample_url': updated_user.get('handwriting_sample_url'),
            'handwriting_samples': updated_user.get('handwriting_samples', []),
            'qr_code_url': updated_user.get('qr_code_url'),
            'price_per_page': updated_user.get('price_per_page'),
            'auth_provider': updated_user.get('auth_provider'),
            'is_custom_profile_picture': updated_user.get('is_custom_profile_picture', False),
        })

import urllib.request
import json
import random
import re

class GoogleLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            access_token = request.data.get('access_token')
            id_token_str = request.data.get('id_token') or request.data.get('credential')
            desired_username = request.data.get('username')
            if not access_token and not id_token_str:
                return Response({'error': 'access_token or id_token required'}, status=status.HTTP_400_BAD_REQUEST)

            google_user = None

            # 1. Try validating access_token via Google UserInfo API
            if not google_user and access_token:
                url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={access_token}"
                try:
                    req = urllib.request.Request(url)
                    with urllib.request.urlopen(req) as response:
                        google_user = json.loads(response.read().decode())
                except Exception as e:
                    print("Google access_token validation failed:", e)

            # 3. Try validating id_token via Google TokenInfo API
            if not google_user and id_token_str:
                url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token_str}"
                try:
                    req = urllib.request.Request(url)
                    with urllib.request.urlopen(req) as response:
                        google_user = json.loads(response.read().decode())
                except Exception as e:
                    print("Google id_token validation failed:", e)

            if not google_user or not google_user.get('email'):
                return Response({'error': 'Invalid Google token or unable to retrieve email from Google'}, status=status.HTTP_400_BAD_REQUEST)

            email = google_user.get('email').lower()
            name = google_user.get('name') or email.split('@')[0]
            picture = google_user.get('picture', '')

            # Find user in database
            user = None
            try:
                user = UserRepository.get_by_email(email)
            except Exception as dberr:
                print("Database query failed in GoogleLoginView:", dberr)

            if not user:
                # Sign up a new Google user
                user_id = str(uuid.uuid4())
                
                # 1. Clean and validate username
                base_username = desired_username or email.split('@')[0]
                cleaned = base_username.replace(" ", "").lower()
                cleaned = re.sub(r'[^a-z0-9_.]', '', cleaned)
                if len(cleaned) < 3:
                    cleaned = (cleaned + 'user')[:3]
                username = cleaned[:30]
                
                # 2. Check if username is taken
                existing_by_username = UserRepository.get_by_email_or_username(username)
                if existing_by_username:
                    suggestions = []
                    for i in range(1, 6):
                        sugg = f"{username}{i}"[:30]
                        if not UserRepository.get_by_email_or_username(sugg):
                            suggestions.append(sugg)
                        if len(suggestions) >= 3:
                            break
                    return Response({
                        'error': 'USERNAME_TAKEN',
                        'suggestions': suggestions
                    }, status=status.HTTP_409_CONFLICT)

                dummy_password = pbkdf2_sha256.hash(str(uuid.uuid4()))
                
                new_user = {
                    'id': user_id,
                    'email': email,
                    'username': username,
                    'password': dummy_password,
                    'name': name,
                    'role': 'STUDENT',
                    'avatar': picture,
                    'auth_provider': 'google',
                    'is_custom_profile_picture': False,
                    'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
                try:
                    UserRepository.create(new_user)
                    created_user = UserRepository.get_by_id(user_id)
                    if created_user:
                        user = created_user
                    else:
                        user = new_user
                except Exception as createerr:
                    print("Database create failed in GoogleLoginView:", createerr)
                    user = new_user
            else:
                # Existing user — sync Google profile picture if they haven't uploaded a custom one
                updates_for_existing = {}
                
                # Always update auth_provider to google if not already set
                if not user.get('auth_provider'):
                    updates_for_existing['auth_provider'] = 'google'
                
                # Sync Google avatar only if user hasn't uploaded a custom profile picture
                if not user.get('is_custom_profile_picture', False) and picture:
                    updates_for_existing['avatar'] = picture
                
                if updates_for_existing:
                    try:
                        UserRepository.update(user['id'], updates_for_existing)
                        user = UserRepository.get_by_id(user['id']) or {**user, **updates_for_existing}
                    except Exception as syncerr:
                        print("Google profile sync failed:", syncerr)
                        user = {**user, **updates_for_existing}

            # Generate JWT Token
            token_payload = {
                'user_id': user['id'],
                'email': user['email'],
                'role': user.get('role', 'STUDENT'),
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
            }
            token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')

            return Response({
                'key': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user.get('name'),
                    'role': user.get('role', 'STUDENT'),
                    'avatar': user.get('avatar'),
                    'username': user.get('username'),
                    'address': user.get('address', ''),
                    'is_verified': user.get('is_verified', False),
                    'handwriting_style': user.get('handwriting_style'),
                    'handwriting_confidence': user.get('handwriting_confidence'),
                    'handwriting_sample_url': user.get('handwriting_sample_url'),
                    'handwriting_samples': user.get('handwriting_samples', []),
                    'qr_code_url': user.get('qr_code_url'),
                    'price_per_page': user.get('price_per_page'),
                    'auth_provider': user.get('auth_provider'),
                    'is_custom_profile_picture': user.get('is_custom_profile_picture', False),
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FileUploadView(APIView):

    authentication_classes = [] # Allow public upload for now, or add JWTAuthentication
    permission_classes = []

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        file_name = f"{uuid.uuid4()}_{file.name}"
        
        # Save to media folder
        media_path = Path(settings.MEDIA_ROOT) / 'uploads'
        media_path.mkdir(parents=True, exist_ok=True)
        
        file_path = media_path / file_name
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        file_url = f"/media/uploads/{file_name}"
        return Response({'url': file_url}, status=status.HTTP_201_CREATED)


class UserManagementView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, user_id):
        try:
            user = UserRepository.get_by_id(user_id)
            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(user)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, user_id):
        try:
            updates = request.data
            user = UserRepository.update(user_id, updates)
            if not user:
                return Response({'error': 'User not found or update failed'}, status=status.HTTP_404_NOT_FOUND)
            return Response(user)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, user_id):
        try:
            UserRepository.delete(user_id)
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print("Database delete failed, returning 204 for local sync fallback:", e)
            return Response({'message': 'User delete processed'}, status=status.HTTP_204_NO_CONTENT)

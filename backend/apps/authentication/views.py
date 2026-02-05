from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import jwt
import datetime
from passlib.hash import pbkdf2_sha256
import uuid
from utils.mongo import db

# Helper to get DB
# db imported above

class RegisterView(APIView):
    authentication_classes = [] # Disable CSRF check implied by SessionAuth
    permission_classes = []

    def post(self, request):
        try:
            data = request.data
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            username = data.get('username') # New field
            role = data.get('role', 'STUDENT')
            avatar = data.get('avatar', '') # New field
            address = data.get('address', '') # New field

            print(f"Register attempt: {email}, {username}")

            if not email or not password or not username:
                return Response({'error': 'Email, password, and username required'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists (email OR username)
            if db is None:
                print("CRITICAL: MongoDB not connected")
                return Response({'error': 'Database error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            if db.users.find_one({'$or': [{'email': email}, {'username': username}]}):
                existing_user = db.users.find_one({'$or': [{'email': email}, {'username': username}]})
                if existing_user.get('username') == username:
                     return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Hash password
            hashed_password = pbkdf2_sha256.hash(password)

            user_id = str(uuid.uuid4())
            new_user = {
                'id': user_id,
                'email': email,
                'username': username, # Store username
                'password': hashed_password, # Store hash!
                'name': name,
                'role': role,
                'avatar': avatar,
                'address': address,
                'created_at': datetime.datetime.utcnow()
            }

            db.users.insert_one(new_user)
            print("User inserted successfully")
            
            # Determine redirect/payload
            return Response({'message': 'User created successfully', 'user': {
                'email': email, 
                'username': username, 
                'role': role, 
                'id': user_id, 
                'avatar': avatar,
                'handwriting_style': None,
                'handwriting_confidence': None,
                'handwriting_sample_url': None
            }}, status=status.HTTP_201_CREATED)
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

        if not identifier or not password:
             return Response({'error': 'Please provide both username/email and password'}, status=status.HTTP_400_BAD_REQUEST)

        # Find by email OR username
        user = db.users.find_one({
            '$or': [
                {'email': identifier},
                {'username': identifier}
            ]
        })

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not pbkdf2_sha256.verify(password, user['password']):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate Token (Simple JWT or custom)
        # Using pyjwt for simplicity
        token_payload = {
            'user_id': user['id'],
            'email': user['email'],
            'role': user.get('role', 'STUDENT'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }
        token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')

        return Response({
            'key': token, # Frontend expects 'key' or 'access' depending on previous dj-rest-auth? dj-rest-auth uses 'key' or 'access_token'
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
            }
        })

class UserDetailsView(APIView):
    # Retrieve and Update user details
    # Expects Authorization: Bearer <token> (or Token ?)
    # My simple implementation in api.ts uses 'Bearer' or 'Token'.
    # I need a custom authentication class or manually decode token here because I disabled global auth classes?
    # Ideally I should use a permission class, but since I am using manual JWT encoding in LoginView...
    # I need to duplicate the verify logic or use a middleware/DRF auth.
    # For speed/simplicity in this "Do it yourself" backend, I'll verifying token in the view.
    
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
            user = db.users.find_one({'id': user_id})
            return user
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
            'first_name': user.get('name', '').split(' ')[0], # Adapter for frontend expecting first_name
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
        if 'avatar' in updates: valid_updates['avatar'] = updates['avatar']
        if 'availability_status' in updates: valid_updates['availability_status'] = updates['availability_status']
        if 'coordinates' in updates: valid_updates['coordinates'] = updates['coordinates']
        if 'handwriting_samples' in updates: valid_updates['handwriting_samples'] = updates['handwriting_samples']
        if 'qr_code_url' in updates: valid_updates['qr_code_url'] = updates['qr_code_url']
        
        if valid_updates:
            db.users.update_one({'id': user['id']}, {'$set': valid_updates})
            
        # Return updated user
        updated_user = db.users.find_one({'id': user['id']})
        
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
        })

class RequestPasswordResetView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = db.users.find_one({'email': email})
        if not user:
            # For security, don't reveal if user exists. But for UX/Demo, we might return error.
            # Let's verify user actually exists for this MVP.
            return Response({'error': 'User not found with this email'}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        import random
        otp = str(random.randint(100000, 999999))
        
        # Save to DB (password_resets collection)
        expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        db.password_resets.update_one(
            {'email': email},
            {'$set': {'otp': otp, 'created_at': datetime.datetime.utcnow(), 'expires_at': expiry}},
            upsert=True
        )

        # Send Email (Console Backend)
        from django.core.mail import send_mail
        try:
            print(f"--- OTP for {email}: {otp} ---") # Explicit print for console visibility
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
        record = db.password_resets.find_one({'email': email})
        if not record:
            return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

        if record['otp'] != otp:
             return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        if datetime.datetime.utcnow() > record['expires_at']:
             return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Update Password
        hashed_password = pbkdf2_sha256.hash(new_password)
        db.users.update_one({'email': email}, {'$set': {'password': hashed_password}})
        
        # Delete OTP record
        db.password_resets.delete_one({'email': email})

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
        
        query = {}
        if role:
            # Handle frontend mapping mismatch (api.ts sends 'provider' for writers, or 'WRITER')
            if role == 'provider':
                query['$or'] = [{'role': 'provider'}, {'role': 'WRITER'}]
            else:
                query['role'] = role
            
        users = list(db.users.find(query))
        
        results = []
        for u in users:
            user_data = {
                'id': u.get('id', str(u.get('_id'))),
                'email': u.get('email'),
                'name': u.get('name') or u.get('first_name', '') + ' ' + u.get('last_name', ''),
                'first_name': u.get('first_name'),
                'last_name': u.get('last_name'),
                'username': u.get('username'),
                'role': u.get('role'),
                'avatar': u.get('avatar'),
                'address': u.get('address'),
                'is_verified': u.get('is_verified', False),
                'handwriting_style': u.get('handwriting_style'), # Include new fields
                'handwriting_confidence': u.get('handwriting_confidence'),
                'availability_status': u.get('availability_status', 'ONLINE'),
                'handwriting_samples': u.get('handwriting_samples', []),
                'qr_code_url': u.get('qr_code_url'),
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
        # In a real app, verify admin permissions here
        result = db.users.delete_one({'id': user_id})
        if result.deleted_count > 0:
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        else:
            # Try by _id just in case
            try:
                from bson.objectid import ObjectId
                result = db.users.delete_one({'_id': ObjectId(user_id)})
                if result.deleted_count > 0:
                    return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
            except:
                pass
                
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

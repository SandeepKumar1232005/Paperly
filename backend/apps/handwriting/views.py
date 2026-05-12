from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.files.storage import FileSystemStorage
import os
import jwt
from utils.firebase import db
from google.cloud import firestore
from .utils import predict_handwriting_style

class PredictHandwritingView(APIView):
    authentication_classes = [] 
    permission_classes = []

    def get_user_from_token(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        try:
            # "Bearer <token>"
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if db is not None:
                doc = db.collection('users').document(user_id).get()
                return doc.to_dict() if doc.exists else None
            return None
        except Exception as e:
            print(f"Token Error: {e}")
            return None

    def post(self, request):
        # 1. Authenticate (Optional but recommended since it updates user profile)
        # If the requirement implies this is a public tool, we can skip. 
        # But "Update Writer model" implies we should know WHICH writer.
        user = self.get_user_from_token(request)
        if not user:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Predict
        style, confidence = predict_handwriting_style(image_file)
        
        if style is None:
            return Response({'error': 'Prediction failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2a. Save Image to Disk
        fs = FileSystemStorage()
        filename = fs.save(f"handwriting_samples/{image_file.name}", image_file)
        file_url = fs.url(filename)

        # 3. Update User (Writer) Profile
        if db is not None:
            db.collection('users').document(user['id']).update({
                'handwriting_style': style,
                'handwriting_confidence': confidence,
                'handwriting_sample_url': file_url,
                'handwriting_samples': firestore.ArrayUnion([file_url])
            })

        # 4. Return Result
        return Response({
            'style': style,
            'confidence': confidence,
            'sample_url': file_url
        }, status=status.HTTP_200_OK)


def get_user_from_token(request):
    """Shared helper to extract user from JWT token."""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if db is not None:
            doc = db.collection('users').document(user_id).get()
            return doc.to_dict() if doc.exists else None
        return None
    except Exception as e:
        print(f"Token Error: {e}")
        return None


class WriterSamplesView(APIView):
    """GET: Fetch writer handwriting samples. POST: Upload a new sample."""
    authentication_classes = []
    permission_classes = []

    def get(self, request, writer_id):
        """Public endpoint - any student can view a writer's samples."""
        if db is None:
            return Response({'error': 'Database error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            doc = db.collection('users').document(writer_id).get()
            if not doc.exists:
                return Response({'error': 'Writer not found'}, status=status.HTTP_404_NOT_FOUND)
            
            user_data = doc.to_dict()
            samples = user_data.get('handwriting_samples', [])
            price_per_page = user_data.get('price_per_page')
            
            return Response({
                'samples': samples,
                'writer_id': writer_id,
                'price_per_page': price_per_page,
                'handwriting_style': user_data.get('handwriting_style'),
                'handwriting_confidence': user_data.get('handwriting_confidence'),
            })
        except Exception as e:
            print(f"Error fetching samples: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, writer_id):
        """Authenticated endpoint - writer uploads a new sample image."""
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Ensure the authenticated user is the writer themselves
        if user.get('id') != writer_id:
            return Response({'error': 'You can only upload samples to your own profile'}, 
                          status=status.HTTP_403_FORBIDDEN)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if image_file.content_type not in allowed_types:
            return Response({'error': 'File type not allowed. Use JPG, PNG, WebP, or PDF.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Check max samples limit (10)
        try:
            doc = db.collection('users').document(writer_id).get()
            if doc.exists:
                current_samples = doc.to_dict().get('handwriting_samples', [])
                if len(current_samples) >= 10:
                    return Response({'error': 'Maximum 10 samples allowed. Delete some before uploading more.'}, 
                                  status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error checking sample count: {e}")

        # Save file to disk
        fs = FileSystemStorage()
        filename = fs.save(f"handwriting_samples/{writer_id}/{image_file.name}", image_file)
        file_url = fs.url(filename)

        # Append URL to Firestore handwriting_samples array
        try:
            db.collection('users').document(writer_id).update({
                'handwriting_samples': firestore.ArrayUnion([file_url])
            })
        except Exception as e:
            print(f"Error updating Firestore: {e}")
            return Response({'error': 'Failed to save sample'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'url': file_url,
            'message': 'Sample uploaded successfully'
        }, status=status.HTTP_201_CREATED)


class DeleteSampleView(APIView):
    """DELETE: Remove a handwriting sample from a writer's profile."""
    authentication_classes = []
    permission_classes = []

    def post(self, request, writer_id):
        """Using POST instead of DELETE to pass body data easily."""
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Ensure the authenticated user is the writer themselves
        if user.get('id') != writer_id:
            return Response({'error': 'You can only delete your own samples'}, 
                          status=status.HTTP_403_FORBIDDEN)

        sample_url = request.data.get('url')
        if not sample_url:
            return Response({'error': 'Sample URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Remove from Firestore array
            db.collection('users').document(writer_id).update({
                'handwriting_samples': firestore.ArrayRemove([sample_url])
            })

            # Try to delete the file from disk (best effort)
            try:
                # Convert URL back to file path
                if sample_url.startswith('/media/'):
                    file_path = os.path.join(settings.MEDIA_ROOT, sample_url.replace('/media/', ''))
                    if os.path.exists(file_path):
                        os.remove(file_path)
            except Exception as e:
                print(f"Warning: Could not delete file from disk: {e}")

            return Response({'message': 'Sample deleted successfully'})
        except Exception as e:
            print(f"Error deleting sample: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

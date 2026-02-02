from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import jwt
from utils.mongo import db
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
                user = db.users.find_one({'id': user_id})
                return user
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

        # 3. Update User (Writer) Profile
        if db is not None:
            db.users.update_one(
                {'id': user['id']},
                {'$set': {
                    'handwriting_style': style,
                    'handwriting_confidence': confidence
                }}
            )

        # 4. Return Result
        return Response({
            'style': style,
            'confidence': confidence
        }, status=status.HTTP_200_OK)

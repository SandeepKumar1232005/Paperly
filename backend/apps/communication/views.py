import uuid
import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from utils.firebase import db

class MessageViewSet(viewsets.ViewSet):
    """
    Firestore-backed Message ViewSet
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def list(self, request):
        try:
            receiver_id = request.query_params.get('receiverId')
            sender_id = request.query_params.get('senderId')
            
            messages_ref = db.collection('messages')
            query = messages_ref
            
            if receiver_id:
                query = query.where('receiverId', '==', receiver_id)
            if sender_id:
                query = query.where('senderId', '==', sender_id)
                
            docs = query.stream()
            results = [doc.to_dict() for doc in docs]
            results.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            data = request.data
            msg_id = str(uuid.uuid4())
            data['id'] = msg_id
            data['timestamp'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            db.collection('messages').document(msg_id).set(data)
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AnnouncementViewSet(viewsets.ViewSet):
    """
    Firestore-backed Announcement ViewSet
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def list(self, request):
        try:
            docs = db.collection('announcements').stream()
            results = [doc.to_dict() for doc in docs]
            results.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            data = request.data
            ann_id = str(uuid.uuid4())
            data['id'] = ann_id
            data['createdAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            db.collection('announcements').document(ann_id).set(data)
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

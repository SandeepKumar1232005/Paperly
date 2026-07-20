import uuid
import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from database.repositories.messages import MessageRepository
from database.repositories.announcements import AnnouncementRepository

class MessageViewSet(viewsets.ViewSet):
    """
    Supabase PostgreSQL-backed Message ViewSet
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def list(self, request):
        try:
            receiver_id = request.query_params.get('receiverId')
            sender_id = request.query_params.get('senderId')
            
            results = MessageRepository.list_filtered(
                sender_id=sender_id,
                receiver_id=receiver_id
            )
            
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            msg_id = str(uuid.uuid4())
            data['id'] = msg_id
            data['timestamp'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            created = MessageRepository.create(data)
            return Response(created, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AnnouncementViewSet(viewsets.ViewSet):
    """
    Supabase PostgreSQL-backed Announcement ViewSet
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def list(self, request):
        try:
            results = AnnouncementRepository.list_all()
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            ann_id = str(uuid.uuid4())
            data['id'] = ann_id
            data['createdAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            created = AnnouncementRepository.create(data)
            return Response(created, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

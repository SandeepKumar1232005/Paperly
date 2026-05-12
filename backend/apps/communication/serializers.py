from rest_framework import serializers
from .models import Message, Announcement
from apps.authentication.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    recipient_details = UserSerializer(source='recipient', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_details', 'recipient', 'recipient_details', 'assignment', 'content', 'file', 'is_read', 'timestamp']

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.first_name')
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'target_audience', 'created_by', 'created_by_name', 'created_at', 'is_active']
        read_only_fields = ['created_by', 'created_at']

from rest_framework import serializers
from .models import Dispute, SupportTicket
from apps.authentication.serializers import UserSerializer

class DisputeSerializer(serializers.ModelSerializer):
    raiser_details = UserSerializer(source='raiser', read_only=True)
    assignment_title = serializers.ReadOnlyField(source='assignment.title')

    class Meta:
        model = Dispute
        fields = ['id', 'assignment', 'assignment_title', 'raiser', 'raiser_details', 'reason', 'status', 'resolution_notes', 'created_at', 'updated_at']
        read_only_fields = ['raiser', 'created_at', 'updated_at']

class SupportTicketSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = SupportTicket
        fields = ['id', 'user', 'user_details', 'subject', 'message', 'status', 'admin_response', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

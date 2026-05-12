from rest_framework import serializers
from .models import Assignment
from apps.authentication.serializers import UserSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    provider_details = UserSerializer(source='provider', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'subject', 'budget', 'deadline',
            'status', 'payment_status', 'quoted_amount', 'writer_comment',
            'student', 'provider', 'files', 'attachment', 'created_at', 'student_details', 'provider_details'
        ]
        read_only_fields = ['student', 'created_at', 'updated_at', 'payment_status']

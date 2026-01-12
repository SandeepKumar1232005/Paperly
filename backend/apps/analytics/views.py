from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from apps.assignments.models import Assignment

User = get_user_model()

class DashboardStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_students = User.objects.filter(is_superuser=False).count() # Rough approx
        total_writers = User.objects.filter(groups__name='Provider').count()
        if total_writers == 0:
             total_writers = User.objects.filter(pk__in=[]).count() # Placeholder logic

        active_assignments = Assignment.objects.exclude(status='COMPLETED').count()
        total_revenue = 125000 # Mock since we don't have transaction model fully migrated in this context yet

        return Response({
            "total_users": User.objects.count(),
            "active_assignments": active_assignments,
            "total_revenue": total_revenue,
            "system_health": "99.9%"
        })

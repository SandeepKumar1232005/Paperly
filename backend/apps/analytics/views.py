from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from database.repositories.users import UserRepository
from database.repositories.assignments import AssignmentRepository

class DashboardStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        users = UserRepository.list_all()
        total_users = len(users)
        
        assignments = AssignmentRepository.list_all()
        active_assignments = len([a for a in assignments if a.get('status') not in ('COMPLETED', 'CANCELLED', None)])

        total_revenue = 125000 

        return Response({
            "total_users": total_users,
            "active_assignments": active_assignments,
            "total_revenue": total_revenue,
            "system_health": "99.9%"
        })

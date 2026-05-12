from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from utils.firebase import db

class DashboardStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if db:
            docs = list(db.collection('users').stream())
            total_users = len(docs)
            # active_assignments = db.assignments.count_documents({'status': {'$ne': 'COMPLETED'}})
            active_assignments = 0 # Placeholder until assignments are migrated
        else:
            total_users = 0
            active_assignments = 0
        
        total_revenue = 125000 

        return Response({
            "total_users": total_users,
            "active_assignments": active_assignments,
            "total_revenue": total_revenue,
            "system_health": "99.9%"
        })

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Assignment
from .serializers import AssignmentSerializer
from apps.authentication.models import User

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Allow creating assignment with specific provider if passed in data
        # Note: provider is read-only in serializer, so we get it from request.data
        provider_id = self.request.data.get('provider_id')
        provider = None
        if provider_id:
            try:
                provider = User.objects.get(id=provider_id, role='provider')
            except User.DoesNotExist:
                pass # Ignore invalid provider
        
        serializer.save(student=self.request.user, status='PENDING_REVIEW', provider=provider)

    def destroy(self, request, *args, **kwargs):
        assignment = self.get_object()
        
        # Check if user is the owner (student)
        if assignment.student != request.user:
            return Response(
                {'error': 'You do not have permission to delete this assignment.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Check if assignment is in a deletable state (PENDING_REVIEW, QUOTED)
        if assignment.status not in ['PENDING_REVIEW', 'QUOTED']:
             return Response(
                {'error': 'Cannot delete assignment that has been confirmed or is in progress.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='quote')
    def submit_quote(self, request, pk=None):
        assignment = self.get_object()
        # Only writers can quote
        if request.user.role != 'provider':
             return Response({'error': 'Only writers can submit quotes.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Can only quote if pending review
        if assignment.status != 'PENDING_REVIEW':
            return Response({'error': 'Assignment is not pending review.'}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get('amount')
        comment = request.data.get('comment')
        
        if not amount:
             return Response({'error': 'Amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        assignment.quoted_amount = amount
        assignment.writer_comment = comment
        assignment.provider = request.user # Assign the writer who quoted
        assignment.status = 'QUOTED'
        assignment.save()
        
        return Response(self.get_serializer(assignment).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_assignment(self, request, pk=None):
        assignment = self.get_object()
        
        # Only the assigned provider can reject
        if request.user != assignment.provider:
            return Response({'error': 'You are not assigned to this task.'}, status=status.HTTP_403_FORBIDDEN)

        # Reset assignment
        assignment.provider = None
        assignment.status = 'PENDING_REVIEW'
        assignment.quoted_amount = None
        assignment.writer_comment = None
        assignment.save()

        return Response({'status': 'rejected', 'message': 'Assignment rejected and returned to pool.'})

    @action(detail=True, methods=['post'], url_path='respond-quote')
    def respond_to_quote(self, request, pk=None):
        assignment = self.get_object()
        # Only the student who created it can respond
        if request.user != assignment.student:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
        if assignment.status != 'QUOTED':
            return Response({'error': 'No quote to respond to.'}, status=status.HTTP_400_BAD_REQUEST)

        action_type = request.data.get('action') # ACCEPT or REJECT
        
        if action_type == 'ACCEPT':
            assignment.status = 'CONFIRMED'
            assignment.budget = assignment.quoted_amount # Update verified budget
            assignment.save()
            return Response({'status': 'confirmed', 'message': 'Quote accepted. Proceed to payment.'})
            
        elif action_type == 'REJECT':
            assignment.status = 'PENDING_REVIEW' # Back to pool
            assignment.provider = None
            assignment.quoted_amount = None
            assignment.writer_comment = None
            assignment.save()
            return Response({'status': 'rejected', 'message': 'Quote rejected. Assignment is back to pending review.'})
            
        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


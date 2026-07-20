from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from database.repositories.assignments import AssignmentRepository
from database.repositories.notifications import NotificationRepository
from database.repositories.users import UserRepository
import uuid
import datetime

class AssignmentViewSet(viewsets.ViewSet):
    """
    Supabase PostgreSQL-backed Assignment ViewSet
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def list(self, request):
        try:
            # Get all assignments
            all_assignments = AssignmentRepository.list_all()
            
            results = []
            user_id = request.query_params.get('userId')
            
            # Fetch user to check role and handwriting_style
            current_user = None
            if user_id:
                current_user = UserRepository.get_by_id(user_id)

            for data in all_assignments:
                # Ensure the ID is present
                if 'id' not in data:
                    continue
                    
                # Security: Filter direct assignments
                if data.get('assignmentType') == 'DIRECT':
                    if not user_id or (data.get('assignedWriterId') != user_id and data.get('studentId') != user_id):
                        continue
                        
                # Security: Filter handwriting styles for WRITERS
                if current_user and current_user.get('role') == 'WRITER' and data.get('assignmentType') != 'DIRECT':
                    visibility = data.get('visibility', 'ALL_WRITERS')
                    if visibility == 'SELECTED_STYLES':
                        preferred_styles = data.get('preferredHandwritingStyles', [])
                        writer_style = current_user.get('handwriting_style')
                        if not writer_style or writer_style not in preferred_styles:
                            continue

                results.append(data)
            
            # Already sorted by created_at desc from repository
            return Response(results)
        except Exception as e:
            print(f"Error fetching assignments: {e}")
            return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            # Use provided ID or generate one
            assignment_id = data.get('id') or str(uuid.uuid4())
            
            # Ensure createdAt is set
            if 'createdAt' not in data:
                data['createdAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            # Ensure id is in the document data
            data['id'] = assignment_id
            
            # Handle Direct Hire Assignment Request
            if data.get('assignedWriterId'):
                data['assignmentType'] = 'DIRECT'
                data['status'] = 'PENDING_WRITER_ACCEPTANCE'
                # Generate Notification for the specific writer
                writer_id = data['assignedWriterId']
                notification_id = str(uuid.uuid4())
                NotificationRepository.create({
                    'id': notification_id,
                    'userId': writer_id,
                    'type': 'DIRECT_ASSIGNMENT_REQUEST',
                    'title': 'New Direct Assignment Request',
                    'message': f"You have received a direct assignment request for '{data.get('title', 'Assignment')}'.",
                    'assignmentId': assignment_id,
                    'isRead': False,
                    'timestamp': data['createdAt']
                })
                # Broadcast the event
                from asgiref.sync import async_to_sync
                from channels.layers import get_channel_layer
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'assignments',
                        {
                            'type': 'direct_assignment_created',
                            'assignment_id': assignment_id,
                            'writer_id': writer_id
                        }
                    )
            else:
                # General assignment creation broadcast
                if not data.get('assignmentType'):
                    data['assignmentType'] = 'MARKETPLACE'
                    
                from asgiref.sync import async_to_sync
                from channels.layers import get_channel_layer
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'assignments',
                        {
                            'type': 'assignment_created',
                            'assignment_id': assignment_id,
                            'visibility': data.get('visibility', 'ALL_WRITERS'),
                            'preferredHandwritingStyles': data.get('preferredHandwritingStyles', [])
                        }
                    )
            
            # Save to Supabase
            created = AssignmentRepository.create(data)
            
            return Response(created, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating assignment: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None):
        try:
            assignment = AssignmentRepository.get_by_id(pk)
            if assignment:
                return Response(assignment)
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def update(self, request, pk=None):
        try:
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            AssignmentRepository.update(pk, data)
            
            # Return updated doc
            updated = AssignmentRepository.get_by_id(pk)
            return Response(updated)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        try:
            assignment = AssignmentRepository.get_by_id(pk)
            if not assignment:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
            
            current_status = assignment.get('status')
            
            # Extract optional cancellation data from query_params or data
            reason = request.query_params.get('reason') or request.data.get('reason', '')
            student_id = request.query_params.get('studentId') or request.data.get('studentId') or assignment.get('studentId')
            writer_id = assignment.get('writerId')
            
            if current_status in ['ASSIGNED', 'IN_PROGRESS', 'ACCEPTED', 'CONFIRMED']:
                # Soft delete / Cancel
                AssignmentRepository.update(pk, {
                    'status': 'CANCELLED',
                    'cancelledBy': student_id,
                    'cancelledAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    'cancellationReason': reason
                })
                
                # Create Notification
                if writer_id:
                    notif_id = f"notif-{uuid.uuid4().hex[:12]}"
                    NotificationRepository.create({
                        'id': notif_id,
                        'userId': writer_id,
                        'type': 'ASSIGNMENT_CANCELLED',
                        'title': 'Assignment Cancelled',
                        'message': f'The student has cancelled Assignment "{assignment.get("title", pk)}".',
                        'assignmentId': pk,
                        'studentId': student_id,
                        'writerId': writer_id,
                        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        'isRead': False
                    })
                
                # Broadcast via channels
                try:
                    from channels.layers import get_channel_layer
                    from asgiref.sync import async_to_sync
                    channel_layer = get_channel_layer()
                    if channel_layer:
                        async_to_sync(channel_layer.group_send)(
                            'assignments',
                            {
                                'type': 'assignment_cancelled',
                                'assignment_id': pk,
                                'writer_id': writer_id
                            }
                        )
                except Exception:
                    pass
                return Response({'status': 'CANCELLED'}, status=status.HTTP_200_OK)
                
            else:
                # Hard delete
                AssignmentRepository.delete(pk)
                return Response(status=status.HTTP_204_NO_CONTENT)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ─── QUOTE NEGOTIATION ───────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='quote')
    def submit_quote(self, request, pk=None):
        """Writer submits a quote. Does NOT assign the writer yet."""
        try:
            data = request.data  # amount, comment, writerId
            assignment = AssignmentRepository.get_by_id(pk)

            if not assignment:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)

            # Only allow quoting PENDING assignments
            if assignment.get('status') not in ('PENDING', None):
                return Response({'error': 'Assignment is no longer available for quoting'}, status=status.HTTP_400_BAD_REQUEST)

            writer_id = data.get('writerId')
            quoted_amount = data.get('amount')
            quote_comment = data.get('comment', '')

            # Update assignment — do NOT set writerId
            AssignmentRepository.update(pk, {
                'quotingWriterId': writer_id,
                'quoted_amount': quoted_amount,
                'quoteComment': quote_comment,
                'status': 'PENDING_REVIEW',
            })

            # Notify the student about the received quote
            student_id = assignment.get('studentId')
            if student_id:
                notification_id = str(uuid.uuid4())
                NotificationRepository.create({
                    'id': notification_id,
                    'userId': student_id,
                    'type': 'QUOTE_RECEIVED',
                    'title': 'New Quote Received',
                    'message': f"A writer has quoted \u20b9{quoted_amount} for '{assignment.get('title', 'your assignment')}'.",
                    'assignmentId': pk,
                    'isRead': False,
                    'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
                })

            # Broadcast via channels
            try:
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'assignments',
                        {
                            'type': 'quote_submitted',
                            'assignment_id': pk,
                            'writer_id': writer_id
                        }
                    )
            except Exception:
                pass

            updated = AssignmentRepository.get_by_id(pk)
            return Response(updated)
        except Exception as e:
            print(f"Error submitting quote: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='respond-quote')
    def respond_to_quote(self, request, pk=None):
        """Student accepts or rejects a writer's quote."""
        try:
            action_type = request.data.get('action')  # ACCEPT or REJECT
            assignment = AssignmentRepository.get_by_id(pk)

            if not assignment:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)

            quoting_writer_id = assignment.get('quotingWriterId')

            if action_type == 'ACCEPT':
                # NOW assign the writer and update budget
                AssignmentRepository.update(pk, {
                    'status': 'ASSIGNED',
                    'writerId': quoting_writer_id,
                    'budget': assignment.get('quoted_amount', assignment.get('budget')),
                    'quotingWriterId': None,
                    'acceptedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()
                })

                # Notify writer: quote accepted
                if quoting_writer_id:
                    notification_id = str(uuid.uuid4())
                    NotificationRepository.create({
                        'id': notification_id,
                        'userId': quoting_writer_id,
                        'type': 'QUOTE_ACCEPTED',
                        'title': 'Quote Accepted!',
                        'message': f"Your quote for '{assignment.get('title', 'an assignment')}' was accepted! You can start working.",
                        'assignmentId': pk,
                        'isRead': False,
                        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
                    })

            elif action_type == 'REJECT':
                # Clear quote data and return to PENDING
                AssignmentRepository.update(pk, {
                    'status': 'PENDING',
                    'quotingWriterId': None,
                    'quoted_amount': None,
                    'quoteComment': None,
                })

                # Notify writer: quote rejected
                if quoting_writer_id:
                    notification_id = str(uuid.uuid4())
                    NotificationRepository.create({
                        'id': notification_id,
                        'userId': quoting_writer_id,
                        'type': 'QUOTE_REJECTED',
                        'title': 'Quote Declined',
                        'message': f"Your quote for '{assignment.get('title', 'an assignment')}' was declined. The assignment is back on the marketplace.",
                        'assignmentId': pk,
                        'isRead': False,
                        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
                    })
            else:
                return Response({'error': 'Invalid action. Must be ACCEPT or REJECT.'}, status=status.HTTP_400_BAD_REQUEST)

            # Broadcast via channels
            try:
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'assignments',
                        {
                            'type': 'quote_response',
                            'assignment_id': pk,
                            'action': action_type,
                            'writer_id': quoting_writer_id
                        }
                    )
            except Exception:
                pass

            updated = AssignmentRepository.get_by_id(pk)
            return Response(updated)
        except Exception as e:
            print(f"Error responding to quote: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='withdraw-quote')
    def withdraw_quote(self, request, pk=None):
        """Writer withdraws their submitted quote."""
        try:
            assignment = AssignmentRepository.get_by_id(pk)

            if not assignment:
                return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)

            writer_id = request.data.get('writerId')

            # Only the quoting writer can withdraw
            if assignment.get('quotingWriterId') != writer_id:
                return Response({'error': 'You are not the quoting writer'}, status=status.HTTP_403_FORBIDDEN)

            AssignmentRepository.update(pk, {
                'status': 'PENDING',
                'quotingWriterId': None,
                'quoted_amount': None,
                'quoteComment': None,
            })

            # Notify student
            student_id = assignment.get('studentId')
            if student_id:
                notification_id = str(uuid.uuid4())
                NotificationRepository.create({
                    'id': notification_id,
                    'userId': student_id,
                    'type': 'QUOTE_WITHDRAWN',
                    'title': 'Quote Withdrawn',
                    'message': f"A writer has withdrawn their quote for '{assignment.get('title', 'your assignment')}'.",
                    'assignmentId': pk,
                    'isRead': False,
                    'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
                })

            updated = AssignmentRepository.get_by_id(pk)
            return Response(updated)
        except Exception as e:
            print(f"Error withdrawing quote: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ─── ACCEPT ASSIGNMENT (direct accept without negotiation) ────────────

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_assignment(self, request, pk=None):
        try:
            writer_id = request.data.get('writerId')
            if not writer_id:
                return Response({'error': 'writerId is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            success, error_msg = AssignmentRepository.atomic_accept(pk, writer_id)
            
            if not success:
                return Response({'message': error_msg}, status=status.HTTP_409_CONFLICT)
                
            # Broadcast via channels
            try:
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'assignments',
                        {
                            'type': 'assignment_accepted',
                            'assignment_id': pk,
                            'writer_id': writer_id
                        }
                    )
            except Exception:
                pass
            
            # Get updated doc to return
            updated = AssignmentRepository.get_by_id(pk)
            return Response(updated, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ─── DIRECT HIRE ────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='respond-direct')
    def respond_direct(self, request, pk=None):
        try:
            action_type = request.data.get('action') # 'ACCEPT' or 'REJECT'
            assignment = AssignmentRepository.get_by_id(pk)
            
            if not assignment:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
                
            if assignment.get('status') != 'PENDING_WRITER_ACCEPTANCE':
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
                
            writer_id = assignment.get('assignedWriterId')
            student_id = assignment.get('studentId')
                
            if action_type == 'ACCEPT':
                AssignmentRepository.update(pk, {
                    'status': 'ACCEPTED',
                    'writerId': writer_id
                })
                # Broadcast
                try:
                    from channels.layers import get_channel_layer
                    from asgiref.sync import async_to_sync
                    channel_layer = get_channel_layer()
                    if channel_layer:
                        async_to_sync(channel_layer.group_send)(
                            'assignments',
                            {
                                'type': 'direct_assignment_accepted',
                                'assignment_id': pk,
                                'writer_id': writer_id
                            }
                        )
                except Exception:
                    pass
            else:
                AssignmentRepository.update(pk, {
                    'status': 'REJECTED'
                })
                # Broadcast
                try:
                    from channels.layers import get_channel_layer
                    from asgiref.sync import async_to_sync
                    channel_layer = get_channel_layer()
                    if channel_layer:
                        async_to_sync(channel_layer.group_send)(
                            'assignments',
                            {
                                'type': 'direct_assignment_rejected',
                                'assignment_id': pk,
                                'writer_id': writer_id
                            }
                        )
                except Exception:
                    pass
            
            # Add notification for student
            notification_id = str(uuid.uuid4())
            NotificationRepository.create({
                'id': notification_id,
                'userId': student_id,
                'type': 'DIRECT_RESPONSE',
                'title': 'Direct Hire Response',
                'message': f"Your direct hire request was {action_type.lower()}ed.",
                'assignmentId': pk,
                'isRead': False,
                'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
            })
            
            updated = AssignmentRepository.get_by_id(pk)
            return Response(updated, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.firebase import db, run_transaction
import uuid
import datetime

class AssignmentViewSet(viewsets.ViewSet):
    """
    Firestore-backed Assignment ViewSet
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def list(self, request):
        try:
            # Get all assignments
            assignments_ref = db.collection('assignments')
            docs = assignments_ref.stream()
            
            results = []
            user_id = request.query_params.get('userId')
            
            # Fetch user to check role and handwriting_style
            current_user = None
            if user_id:
                user_doc = db.collection('users').document(user_id).get()
                if user_doc.exists:
                    current_user = user_doc.to_dict()

            for doc in docs:
                data = doc.to_dict()
                # Ensure the ID is present
                if 'id' not in data:
                    data['id'] = doc.id
                    
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
            
            # Sort by created_at descending if possible
            results.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
            
            return Response(results)
        except Exception as e:
            print(f"Error fetching assignments: {e}")
            return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request):
        try:
            data = request.data
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
                notification_ref = db.collection('notifications').document(notification_id)
                notification_ref.set({
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
                # Include preferred styles to filter in WebSocket clients
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
            
            # Save to Firestore
            db.collection('assignments').document(assignment_id).set(data)
            
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating assignment: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None):
        try:
            doc_ref = db.collection('assignments').document(pk)
            doc = doc_ref.get()
            if doc.exists:
                return Response(doc.to_dict())
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def update(self, request, pk=None):
        try:
            data = request.data
            doc_ref = db.collection('assignments').document(pk)
            doc_ref.update(data)
            
            # Return updated doc
            updated_doc = doc_ref.get()
            return Response(updated_doc.to_dict())
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        try:
            doc_ref = db.collection('assignments').document(pk)
            doc = doc_ref.get()
            if not doc.exists:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
            
            data = doc.to_dict()
            current_status = data.get('status')
            
            # Extract optional cancellation data from query_params or data
            reason = request.query_params.get('reason') or request.data.get('reason', '')
            student_id = request.query_params.get('studentId') or request.data.get('studentId') or data.get('studentId')
            writer_id = data.get('writerId')
            
            if current_status in ['ASSIGNED', 'IN_PROGRESS', 'ACCEPTED', 'CONFIRMED']:
                # Soft delete / Cancel
                doc_ref.update({
                    'status': 'CANCELLED',
                    'cancelledBy': student_id,
                    'cancelledAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    'cancellationReason': reason
                })
                
                # Create Notification
                if writer_id:
                    notif_id = f"notif-{uuid.uuid4().hex[:12]}"
                    notif_data = {
                        'id': notif_id,
                        'userId': writer_id,
                        'type': 'ASSIGNMENT_CANCELLED',
                        'title': 'Assignment Cancelled',
                        'message': f'The student has cancelled Assignment "{data.get("title", pk)}".',
                        'assignmentId': pk,
                        'studentId': student_id,
                        'writerId': writer_id,
                        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        'isRead': False
                    }
                    db.collection('notifications').document(notif_id).set(notif_data)
                
                # Broadcast via channels
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
                return Response({'status': 'CANCELLED'}, status=status.HTTP_200_OK)
                
            else:
                # Hard delete
                doc_ref.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    @action(detail=True, methods=['post'], url_path='quote')
    def submit_quote(self, request, pk=None):
        # Implementation for submitting a quote
        try:
            data = request.data # amount, comment, writerId
            doc_ref = db.collection('assignments').document(pk)
            
            # For simplicity, we store quotes in an array or update assignment
            # The frontend expects the assignment status to update or a quotes array
            doc_ref.update({
                'writerId': data.get('writerId'),
                'quote_amount': data.get('amount'),
                'quote_comment': data.get('comment'),
                'status': 'PENDING_REVIEW' # Move to review when quote is sent
            })
            return Response(doc_ref.get().to_dict())
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='respond-quote')
    def respond_to_quote(self, request, pk=None):
        try:
            action_type = request.data.get('action') # ACCEPT or REJECT
            doc_ref = db.collection('assignments').document(pk)
            
            if action_type == 'ACCEPT':
                doc_ref.update({'status': 'ASSIGNED'})
            else:
                doc_ref.update({'status': 'PENDING', 'writerId': None})
                
            return Response(doc_ref.get().to_dict())
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_assignment(self, request, pk=None):
        try:
            writer_id = request.data.get('writerId')
            if not writer_id:
                return Response({'error': 'writerId is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            def _accept_txn(transaction):
                doc_ref = db.collection('assignments').document(pk)
                snapshot = transaction.get(doc_ref)
                
                if not snapshot.exists:
                    return False, 'Assignment not found'
                    
                data = snapshot.to_dict()
                if data.get('status') != 'PENDING':
                    return False, 'Assignment already accepted.'
                    
                transaction.update(doc_ref, {
                    'status': 'ASSIGNED',
                    'writerId': writer_id,
                    'acceptedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()
                })
                
                return True, None
                
            success, error_msg = run_transaction(_accept_txn)
            
            if not success:
                return Response({'message': error_msg}, status=status.HTTP_409_CONFLICT)
                
            # Broadcast via channels
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
            
            # Get updated doc to return
            updated_doc = db.collection('assignments').document(pk).get().to_dict()
            return Response(updated_doc, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='respond-direct')
    def respond_direct(self, request, pk=None):
        try:
            action_type = request.data.get('action') # 'ACCEPT' or 'REJECT'
            doc_ref = db.collection('assignments').document(pk)
            doc = doc_ref.get()
            
            if not doc.exists:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
                
            data = doc.to_dict()
            if data.get('status') != 'PENDING_WRITER_ACCEPTANCE':
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
                
            writer_id = data.get('assignedWriterId')
            student_id = data.get('studentId')
                
            if action_type == 'ACCEPT':
                doc_ref.update({
                    'status': 'ACCEPTED',
                    'writerId': writer_id
                })
                # Broadcast
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
            else:
                doc_ref.update({
                    'status': 'REJECTED'
                })
                # Broadcast
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
            
            # Add notification for student
            notification_id = str(uuid.uuid4())
            db.collection('notifications').document(notification_id).set({
                'id': notification_id,
                'userId': student_id,
                'type': 'DIRECT_RESPONSE',
                'title': 'Direct Hire Response',
                'message': f"Your direct hire request was {action_type.lower()}ed.",
                'assignmentId': pk,
                'isRead': False,
                'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat()
            })
            
            return Response(doc_ref.get().to_dict(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

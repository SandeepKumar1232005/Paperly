from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.firebase import db
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
            for doc in docs:
                data = doc.to_dict()
                # Ensure the ID is present
                if 'id' not in data:
                    data['id'] = doc.id
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
            db.collection('assignments').document(pk).delete()
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


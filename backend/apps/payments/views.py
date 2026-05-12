import stripe
import os
import uuid
import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from utils.firebase import db

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = request.data.get('amount')
            assignment_id = request.data.get('assignmentId')
            
            # Create a Transaction record in Firestore
            transaction_id = str(uuid.uuid4())
            transaction_data = {
                'id': transaction_id,
                'assignmentId': assignment_id,
                'amount': amount,
                'status': 'PENDING',
                'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'userId': request.user.id if hasattr(request.user, 'id') else 'anonymous'
            }
            db.collection('transactions').document(transaction_id).set(transaction_data)
            
            # In a real app, you'd call stripe.PaymentIntent.create here
            # intent = stripe.PaymentIntent.create(amount=amount, currency='usd')
            # return Response({'clientSecret': intent.client_secret, 'transactionId': transaction_id})
            
            return Response({
                'clientSecret': f'mock_secret_{transaction_id}',
                'transactionId': transaction_id
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = [] 

    def post(self, request):
        # Implementation for Stripe Webhooks to update transaction status in Firestore
        return Response({'status': 'received'}, status=status.HTTP_200_OK)

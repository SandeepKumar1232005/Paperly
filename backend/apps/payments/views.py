import stripe
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from .models import Transaction
from apps.assignments.models import Assignment

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        assignment_id = request.data.get('assignment_id')
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create Stripe PaymentIntent
        try:
            # Amount in cents
            amount = int(assignment.budget * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='inr',
                automatic_payment_methods={'enabled': True},
                metadata={
                    'assignment_id': assignment.id,
                    'user_id': request.user.id
                }
            )

            # Create local Transaction record
            Transaction.objects.create(
                assignment=assignment,
                user=request.user,
                amount=assignment.budget,
                stripe_payment_intent_id=intent.id,
                status='PENDING'
            )

            return Response({
                'clientSecret': intent.client_secret
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [] # Webhooks are public but signed

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

        if not endpoint_secret:
            return HttpResponse(status=400)

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            return HttpResponse(status=400)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            intent_id = payment_intent['id']
            
            try:
                transaction = Transaction.objects.get(stripe_payment_intent_id=intent_id)
                transaction.status = 'SUCCEEDED'
                transaction.save()

                # Update Assignment
                assignment = transaction.assignment
                assignment.payment_status = 'PAID'
                # Optionally verify status change workflow
                if assignment.status == 'OPEN':
                    assignment.status = 'IN_PROGRESS' 
                assignment.save()
            except Transaction.DoesNotExist:
                pass

        return HttpResponse(status=200)

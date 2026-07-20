from rest_framework import viewsets
from rest_framework.response import Response

class SupportTicketViewSet(viewsets.ViewSet):
    def list(self, request): return Response([])
    def create(self, request): return Response({})
    def retrieve(self, request, pk=None): return Response({})
    def update(self, request, pk=None): return Response({})
    def destroy(self, request, pk=None): return Response({})

class DisputeViewSet(viewsets.ViewSet):
    def list(self, request): return Response([])
    def create(self, request): return Response({})
    def retrieve(self, request, pk=None): return Response({})
    def update(self, request, pk=None): return Response({})
    def destroy(self, request, pk=None): return Response({})

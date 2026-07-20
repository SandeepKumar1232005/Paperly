from rest_framework import viewsets, status
from rest_framework.response import Response

class SystemSettingsViewSet(viewsets.ViewSet):
    def list(self, request, *args, **kwargs):
        return Response({})

    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

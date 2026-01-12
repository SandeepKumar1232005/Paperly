from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportTicketViewSet, DisputeViewSet

router = DefaultRouter()
router.register(r'tickets', SupportTicketViewSet)
router.register(r'disputes', DisputeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

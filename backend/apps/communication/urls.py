from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, AnnouncementViewSet

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'announcements', AnnouncementViewSet, basename='announcements')

urlpatterns = [
    path('', include(router.urls)),
]

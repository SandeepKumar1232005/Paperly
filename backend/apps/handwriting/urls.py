from django.urls import path
from .views import PredictHandwritingView

urlpatterns = [
    path('predict/', PredictHandwritingView.as_view(), name='predict_handwriting'),
]

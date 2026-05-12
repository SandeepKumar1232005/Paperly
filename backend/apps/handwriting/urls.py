from django.urls import path
from .views import PredictHandwritingView, WriterSamplesView, DeleteSampleView

urlpatterns = [
    path('predict/', PredictHandwritingView.as_view(), name='predict_handwriting'),
    path('writers/<str:writer_id>/samples/', WriterSamplesView.as_view(), name='writer_samples'),
    path('writers/<str:writer_id>/samples/delete/', DeleteSampleView.as_view(), name='delete_sample'),
]

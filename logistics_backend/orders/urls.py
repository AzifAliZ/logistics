from django.urls import path
from .views import (
    OrderCreateView,
    OrderStatusUpdateView,
    OrderDetailView,
    OrderListView,
    OrderHistoryView,
)

urlpatterns = [
    path("orders/", OrderCreateView.as_view()),
    path("orders/list/", OrderListView.as_view()),
    path("orders/<uuid:pk>/", OrderDetailView.as_view()),
    path("orders/<uuid:pk>/status/", OrderStatusUpdateView.as_view()),
    path("orders/<uuid:pk>/history/", OrderHistoryView.as_view()),
]

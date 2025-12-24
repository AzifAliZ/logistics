from rest_framework import serializers
from .models import Order, OrderStatusHistory
from .services import is_valid_transition


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "customer_contact",
            "merchant_ref",
            "current_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "current_status", "created_at", "updated_at"]


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField()
    source = serializers.CharField()
    metadata = serializers.JSONField(required=False)

    def validate(self, data):
        order = self.context["order"]
        if not is_valid_transition(order.current_status, data["status"]):
            raise serializers.ValidationError(
                f"Invalid transition from {order.current_status} to {data['status']}"
            )
        return data


class OrderHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = "__all__"

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.mail import send_mail
from rest_framework.views import APIView
from django.db import transaction

from .models import Order, OrderStatusHistory
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    OrderHistorySerializer,
)


# 1️⃣ Create Order
class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer

    def perform_create(self, serializer):
        order = serializer.save()
        OrderStatusHistory.objects.create(
            order=order,
            status="created",
            source="system",
        )


# 2️⃣ Update Order Status
class OrderStatusUpdateView(APIView):
    def post(self, request, pk):
        try:
            order = Order.objects.select_for_update().get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderStatusUpdateSerializer(
            data=request.data, context={"order": order}
        )

        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            new_status = serializer.validated_data["status"]
            
            # Capture old status for email logic
            old_status = order.current_status

            order.current_status = new_status
            order.save()

            OrderStatusHistory.objects.create(
                order=order,
                status=new_status,
                source=serializer.validated_data["source"],
                metadata=serializer.validated_data.get("metadata"),
            )
            
            # Send Notification
            subject = f'Order Update: {order.id}'
            message = f'Hello {order.customer_name},\n\nYour order status has changed from {old_status} to {new_status}.\n\nThank you.'
            from_email = 'noreply@logistics.com'
            recipient_list = [order.customer_contact] # Assuming contact is email
            
            email_status = "sent"
            # Explicit Debug Printing
            print(f"\n========== EMAIL SIMULATION START ==========", flush=True)
            print(f"To: {recipient_list}", flush=True)
            print(f"Subject: {subject}", flush=True)
            print(f"Body: {message}", flush=True)
            
            try:
                # fail_silently=False ensures we get an exception if it fails, ensuring we know about it
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
                print(f"========== EMAIL SIMULATION END (Backend processed successfully) ==========\n", flush=True)
            except Exception as e:
                print(f"========== EMAIL SIMULATION FAILED: {e} ==========\n", flush=True)
                email_status = f"failed: {str(e)}"

        return Response({
            "message": "Status updated successfully",
            "status": "updated", 
            "new_status": new_status,
            "email_simulation": {
                "status": email_status,
                "to": recipient_list,
                "subject": subject,
                "message_preview": message[:50] + "..."
            }
        })


# 3️⃣ Get Single Order (Current State)
class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


# 4️⃣ List Active Orders + Filters
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        qs = Order.objects.all()

        status_param = self.request.query_params.get("status")
        merchant = self.request.query_params.get("merchant")
        customer = self.request.query_params.get("customer")

        if status_param:
            qs = qs.filter(current_status=status_param)
        if merchant:
            qs = qs.filter(merchant_ref=merchant)
        if customer:
            qs = qs.filter(customer_contact=customer)

        return qs


# 5️⃣ Order History
class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderHistorySerializer

    def get_queryset(self):
        return OrderStatusHistory.objects.filter(order_id=self.kwargs["pk"])

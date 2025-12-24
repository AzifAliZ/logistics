import uuid
from django.db import models


class Order(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("picked_up", "Picked Up"),
        ("in_transit", "In Transit"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField(max_length=100)
    customer_contact = models.CharField(max_length=100)
    merchant_ref = models.CharField(max_length=100)

    current_status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="created"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id} - {self.current_status}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(
        Order, related_name="history", on_delete=models.CASCADE
    )
    status = models.CharField(max_length=20)
    source = models.CharField(max_length=50)  # driver / system / admin
    metadata = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

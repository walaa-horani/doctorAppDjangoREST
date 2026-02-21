from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Appointment, Review
from .serializers import AppointmentSerializer, ReviewSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROVIDER':
            return Appointment.objects.filter(provider=user)
        return Appointment.objects.filter(client=user)

    def perform_create(self, serializer):
        service = serializer.validated_data['service']
        serializer.save(client=self.request.user, provider=service.provider)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

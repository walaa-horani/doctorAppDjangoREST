from rest_framework import viewsets, permissions
from .models import Service, Availability
from .serializers import ServiceSerializer, AvailabilitySerializer

class IsProvider(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'PROVIDER'

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsProvider()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsProvider]

    def get_queryset(self):
        return Availability.objects.filter(provider=self.request.user)

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

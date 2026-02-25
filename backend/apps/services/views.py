from rest_framework import viewsets, permissions
from .models import Service, Availability
from .serializers import ServiceSerializer, AvailabilitySerializer

class IsProvider(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'PROVIDER'

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_queryset(self):
        user = self.request.user
        # Authenticated providers only see their own services
        if user.is_authenticated and hasattr(user, 'role') and user.role == 'PROVIDER':
            return Service.objects.filter(provider=user)
        # Clients / unauthenticated users see all active services
        # Optional: filter by provider via ?provider=<id>
        qs = Service.objects.filter(is_active=True)
        provider_id = self.request.query_params.get('provider')
        if provider_id:
            qs = qs.filter(provider_id=provider_id)
        return qs

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

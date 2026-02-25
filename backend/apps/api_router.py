from rest_framework import routers
from django.urls import path, include
from apps.services.views import ServiceViewSet, AvailabilityViewSet
from apps.appointments.views import AppointmentViewSet, ReviewViewSet

router = routers.DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'availability', AvailabilityViewSet, basename='availability')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

from rest_framework import serializers
from .models import Appointment, Review
from apps.services.serializers import ServiceSerializer
from apps.users.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('appointment', 'created_at')

class AppointmentSerializer(serializers.ModelSerializer):
    service_details = ServiceSerializer(source='service', read_only=True)
    client_details = UserSerializer(source='client', read_only=True)
    provider_details = UserSerializer(source='provider', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('client', 'provider', 'created_at', 'updated_at')

    def validate(self, data):
        # Todo: Add validation for overlapping appointments
        return data

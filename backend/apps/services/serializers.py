from rest_framework import serializers
from .models import Service, Availability

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ('provider', 'created_at', 'updated_at')

class AvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ('provider',)

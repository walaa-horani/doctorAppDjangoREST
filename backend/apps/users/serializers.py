from rest_framework import serializers
from .models import User, ProviderProfile

class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = ('business_name', 'bio', 'address', 'profile_image', 'is_verified')
        read_only_fields = ('is_verified',)

class UserSerializer(serializers.ModelSerializer):
    provider_profile = ProviderProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "role", "phone", "first_name", "last_name", "provider_profile")
        read_only_fields = ("id", "email", "role") 

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "password", "role", "phone", "first_name", "last_name")
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

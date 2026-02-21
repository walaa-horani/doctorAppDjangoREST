from django.contrib import admin
from .models import Service, Availability

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'price', 'duration', 'is_active')
    list_filter = ('is_active', 'provider')
    search_fields = ('name', 'provider__email', 'provider__last_name')

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('provider', 'day_of_week', 'start_time', 'end_time', 'is_active')
    list_filter = ('day_of_week', 'provider')


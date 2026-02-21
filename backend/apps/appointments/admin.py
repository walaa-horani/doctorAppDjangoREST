from django.contrib import admin
from .models import Appointment, Review

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'provider', 'service', 'date', 'time_slot', 'status')
    list_filter = ('status', 'date', 'provider', 'client')
    search_fields = ('client__email', 'provider__email', 'service__name')
    list_editable = ('status',)
    date_hierarchy = 'date'
    ordering = ('-date', '-time_slot')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'rating', 'created_at')
    list_filter = ('rating',)

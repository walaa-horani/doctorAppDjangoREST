from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, ProviderProfile, Patient, Doctor

class ProviderProfileInline(admin.StackedInline):
    model = ProviderProfile
    can_delete = False
    verbose_name_plural = 'Provider Profile'
    fk_name = 'user'

@admin.register(Patient)
class PatientAdmin(BaseUserAdmin):
    ordering = ('email',)
    list_display = ("email", "first_name", "last_name", "is_active")
    search_fields = ('email', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone')}),
        (_('Permissions'), {'fields': ('is_active',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'first_name', 'last_name', 'phone'),
        }),
    )
    def get_queryset(self, request):
        return super().get_queryset(request).filter(role=User.Role.CLIENT)
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.role = User.Role.CLIENT
        super().save_model(request, obj, form, change)

@admin.register(Doctor)
class DoctorAdmin(BaseUserAdmin):
    ordering = ('email',)
    list_display = ("email", "first_name", "last_name", "is_verified", "is_active")
    search_fields = ('email', 'first_name', 'last_name', 'provider_profile__business_name')
    inlines = (ProviderProfileInline,)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone')}),
        (_('Permissions'), {'fields': ('is_active',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'first_name', 'last_name', 'phone'),
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).filter(role=User.Role.PROVIDER)
    
    def is_verified(self, obj):
        return obj.provider_profile.is_verified if hasattr(obj, 'provider_profile') else False
    is_verified.boolean = True
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.role = User.Role.PROVIDER
        super().save_model(request, obj, form, change)

# Standard User Admin (for Superusers/Admins)
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ('email',)
    list_display = ("email", "role", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ('email', 'first_name', 'last_name')
    inlines = (ProviderProfileInline,)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone', 'role')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'role', 'phone', 'first_name', 'last_name'),
        }),
    )

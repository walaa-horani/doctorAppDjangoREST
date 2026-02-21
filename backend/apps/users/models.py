from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        PROVIDER = "PROVIDER", "Service Provider"
        CLIENT = "CLIENT", "Client"

    username = None
    email = models.EmailField(_("email address"), unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    phone = models.CharField(max_length=20, blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class PatientManager(CustomUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.CLIENT)

class Patient(User):
    objects = PatientManager()
    class Meta:
        proxy = True
        verbose_name = "Patient"
        verbose_name_plural = "Patients"

class DoctorManager(CustomUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.PROVIDER)

class Doctor(User):
    objects = DoctorManager()
    class Meta:
        proxy = True
        verbose_name = "Doctor/Provider"
        verbose_name_plural = "Doctors/Providers"

    def save(self, *args, **kwargs):
        if not self.pk:
            self.role = User.Role.PROVIDER
        super().save(*args, **kwargs)

class ProviderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    business_name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    profile_image = models.ImageField(upload_to='providers/pfp/', blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, help_text="e.g. Cardiology, Neurology")
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.business_name} ({self.user.email})"

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import ProviderProfile, Doctor
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with dummy doctor data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Data source
        specializations = [
            ('Cardiology', 'Heart Expert'),
            ('Dermatology', 'Skin Specialist'),
            ('Neurology', 'Brain & Nerves'),
            ('Pediatrics', 'Child Care'),
            ('General Practice', 'Primary Care'),
            ('Dentistry', 'Dental Care'),
            ('Orthopedics', 'Bone & Joint'),
            ('Psychiatry', 'Mental Health')
        ]

        doctors_data = [
            {"first": "James", "last": "Wilson", "spec": "Cardiology", "bio": "Expert in interventional cardiology with 15 years of experience."},
            {"first": "Linda", "last": "Chen", "spec": "Dermatology", "bio": "Specializing in cosmetic and medical dermatology."},
            {"first": "Robert", "last": "Fox", "spec": "Neurology", "bio": "Focused on treating migraines and neurological disorders."},
            {"first": "Sarah", "last": "Miller", "spec": "Pediatrics", "bio": "Compassionate care for newborns, children, and adolescents."},
            {"first": "Michael", "last": "Brown", "spec": "General Practice", "bio": "Dedicated to comprehensive family medicine."},
            {"first": "Emily", "last": "Davis", "spec": "Dentistry", "bio": "Creating beautiful smiles with modern dental techniques."},
            {"first": "David", "last": "Martinez", "spec": "Orthopedics", "bio": "Sports medicine and joint replacement specialist."},
            {"first": "Jennifer", "last": "Taylor", "spec": "Psychiatry", "bio": "Helping patients achieve mental wellness and balance."},
            {"first": "William", "last": "Anderson", "spec": "Cardiology", "bio": "Renowned heart surgeon and researcher."},
            {"first": "Elizabeth", "last": "Thomas", "spec": "Pediatrics", "bio": "Friendly and experienced pediatrician loved by kids."},
        ]

        for i, data in enumerate(doctors_data):
            email = f"{data['first'].lower()}.{data['last'].lower()}@example.com"
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"User {email} already exists. Skipping.")
                continue

            # Create User using the Doctor proxy model manager or base User
            # Using base User to be safe with custom manager logic, setting role manually
            user = User.objects.create_user(
                email=email,
                password='password123',
                first_name=data['first'],
                last_name=data['last'],
                role='PROVIDER'
            )
            
            # Create Profile
            ProviderProfile.objects.create(
                user=user,
                business_name=f"Dr. {data['first']} {data['last']}'s Clinic",
                bio=data['bio'],
                address=f"{random.randint(100, 999)} Medical Center Dr, Suite {random.randint(1, 50)}",
                specialization=data['spec'],
                is_verified=True
            )
            
            self.stdout.write(self.style.SUCCESS(f"Created doctor: {data['first']} {data['last']} - {data['spec']}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded doctors!'))

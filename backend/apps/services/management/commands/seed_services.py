from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.services.models import Service, Availability
from datetime import time

User = get_user_model()

# Services by specialization
SERVICES_BY_SPECIALIZATION = {
    "Family Medicine": [
        {"name": "General Checkup", "description": "Comprehensive physical exam including vitals, bloodwork review, and health assessment.", "duration": 30, "price": "80.00"},
        {"name": "Sick Visit", "description": "Evaluation and treatment for acute illnesses such as flu, cold, infections.", "duration": 20, "price": "60.00"},
        {"name": "Chronic Disease Management", "description": "Ongoing management for conditions like hypertension, diabetes, and asthma.", "duration": 45, "price": "100.00"},
    ],
    "Cardiology": [
        {"name": "Cardiac Consultation", "description": "In-depth evaluation for heart symptoms including chest pain, palpitations, and shortness of breath.", "duration": 60, "price": "200.00"},
        {"name": "ECG / EKG Test", "description": "Electrocardiogram to check heart rhythm and detect abnormalities.", "duration": 30, "price": "120.00"},
        {"name": "Blood Pressure Management", "description": "Monitoring and treatment planning for hypertension.", "duration": 30, "price": "90.00"},
    ],
    "Pediatrics": [
        {"name": "Well-Child Visit", "description": "Routine developmental checkup and vaccinations for infants and children.", "duration": 30, "price": "75.00"},
        {"name": "Sick Child Visit", "description": "Evaluation and treatment for pediatric illnesses.", "duration": 20, "price": "55.00"},
        {"name": "Vaccination Appointment", "description": "Scheduled childhood immunizations per CDC guidelines.", "duration": 15, "price": "40.00"},
    ],
    "Neurology": [
        {"name": "Neurology Consultation", "description": "Evaluation of headaches, seizures, memory issues, and other neurological concerns.", "duration": 60, "price": "220.00"},
        {"name": "Migraine Treatment", "description": "Personalized treatment plan for chronic and acute migraines.", "duration": 45, "price": "150.00"},
        {"name": "EEG Evaluation", "description": "Electroencephalogram analysis for epilepsy and seizure disorders.", "duration": 60, "price": "200.00"},
    ],
    "Dermatology": [
        {"name": "Skin Consultation", "description": "Assessment of rashes, acne, eczema, and other skin conditions.", "duration": 30, "price": "130.00"},
        {"name": "Acne Treatment", "description": "Personalized acne treatment plan including topical and oral options.", "duration": 30, "price": "110.00"},
        {"name": "Skin Cancer Screening", "description": "Full-body mole and lesion check for early skin cancer detection.", "duration": 45, "price": "160.00"},
    ],
    "Orthopedics": [
        {"name": "Orthopedic Consultation", "description": "Evaluation of joint pain, sports injuries, and musculoskeletal conditions.", "duration": 45, "price": "180.00"},
        {"name": "Joint Injection", "description": "Corticosteroid or hyaluronic acid injection for knee, shoulder, or hip pain.", "duration": 30, "price": "220.00"},
        {"name": "Sports Injury Assessment", "description": "Diagnosis and treatment plan for acute sports-related injuries.", "duration": 45, "price": "170.00"},
    ],
    "Obstetrics & Gynecology": [
        {"name": "Annual Women's Exam", "description": "Comprehensive gynecological exam including Pap smear and breast exam.", "duration": 45, "price": "140.00"},
        {"name": "Prenatal Visit", "description": "Routine prenatal care appointment with ultrasound and monitoring.", "duration": 30, "price": "120.00"},
        {"name": "Contraception Consultation", "description": "Discussion and prescription of appropriate birth control options.", "duration": 30, "price": "90.00"},
    ],
    "Psychiatry": [
        {"name": "Psychiatric Evaluation", "description": "Initial comprehensive mental health evaluation and diagnosis.", "duration": 60, "price": "250.00"},
        {"name": "Therapy Session", "description": "Individual therapy session for anxiety, depression, trauma, or adjustment issues.", "duration": 50, "price": "180.00"},
        {"name": "Medication Management", "description": "Follow-up visit to review and adjust psychiatric medications.", "duration": 30, "price": "130.00"},
    ],
    "Ophthalmology": [
        {"name": "Comprehensive Eye Exam", "description": "Full eye health evaluation including vision testing and retinal check.", "duration": 45, "price": "150.00"},
        {"name": "LASIK Consultation", "description": "Pre-operative assessment for LASIK laser vision correction eligibility.", "duration": 60, "price": "100.00"},
        {"name": "Glaucoma Screening", "description": "Intraocular pressure measurement and optic nerve evaluation.", "duration": 30, "price": "120.00"},
    ],
    "Endocrinology": [
        {"name": "Diabetes Consultation", "description": "Assessment and management plan for Type 1 or Type 2 diabetes.", "duration": 60, "price": "200.00"},
        {"name": "Thyroid Evaluation", "description": "Blood test review and ultrasound interpretation for thyroid disorders.", "duration": 45, "price": "170.00"},
        {"name": "Hormone Therapy Consultation", "description": "Evaluation and treatment for hormonal imbalances.", "duration": 45, "price": "180.00"},
    ],
}

# Standard weekday availability blocks (Mon-Fri)
WEEKDAY_SLOTS = [
    {"day": 0, "start": time(9, 0), "end": time(12, 0)},   # Monday 9am-12pm
    {"day": 0, "start": time(14, 0), "end": time(17, 0)},  # Monday 2pm-5pm
    {"day": 1, "start": time(9, 0), "end": time(12, 0)},   # Tuesday 9am-12pm
    {"day": 1, "start": time(14, 0), "end": time(17, 0)},  # Tuesday 2pm-5pm
    {"day": 2, "start": time(9, 0), "end": time(12, 0)},   # Wednesday 9am-12pm
    {"day": 3, "start": time(10, 0), "end": time(13, 0)},  # Thursday 10am-1pm
    {"day": 3, "start": time(15, 0), "end": time(18, 0)},  # Thursday 3pm-6pm
    {"day": 4, "start": time(9, 0), "end": time(12, 0)},   # Friday 9am-12pm
]
# Weekend slots for some providers
WEEKEND_SLOTS = [
    {"day": 5, "start": time(10, 0), "end": time(13, 0)},  # Saturday 10am-1pm
]


class Command(BaseCommand):
    help = 'Seed services and availability for all providers'

    def handle(self, *args, **kwargs):
        providers = User.objects.filter(role='PROVIDER').select_related('provider_profile')

        if not providers.exists():
            self.stdout.write(self.style.ERROR('No providers found! Run seed_providers first.'))
            return

        total_services = 0
        total_slots = 0

        for provider in providers:
            profile = getattr(provider, 'provider_profile', None)
            specialization = profile.specialization if profile else None
            services_data = SERVICES_BY_SPECIALIZATION.get(specialization, SERVICES_BY_SPECIALIZATION["Family Medicine"])

            # Seed Services
            for svc in services_data:
                service, created = Service.objects.get_or_create(
                    provider=provider,
                    name=svc["name"],
                    defaults={
                        "description": svc["description"],
                        "duration": svc["duration"],
                        "price": svc["price"],
                        "is_active": True,
                    }
                )
                if created:
                    total_services += 1

            # Seed Availability (weekdays + weekend for even-indexed providers)
            slots = WEEKDAY_SLOTS + (WEEKEND_SLOTS if provider.id % 2 == 0 else [])
            for slot in slots:
                _, created = Availability.objects.get_or_create(
                    provider=provider,
                    day_of_week=slot["day"],
                    start_time=slot["start"],
                    defaults={
                        "end_time": slot["end"],
                        "is_active": True,
                    }
                )
                if created:
                    total_slots += 1

            self.stdout.write(self.style.SUCCESS(
                f'  ✓ Dr. {provider.first_name} {provider.last_name} ({specialization}) — {len(services_data)} services, {len(slots)} availability slots'
            ))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done! Created {total_services} services and {total_slots} availability slots across {providers.count()} providers.'
        ))

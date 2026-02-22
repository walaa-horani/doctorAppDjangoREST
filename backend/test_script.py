import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User

with open('users.txt', 'w') as f:
    for u in User.objects.all():
        f.write(f"Email: {u.email} - Role: {u.role}\n")

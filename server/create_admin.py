import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nkombo_backend.settings')
django.setup()

from accounts.models import User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@gsnkombo.edu', 'admin123', first_name='Admin', last_name='User', role='headmaster')
    print('Superuser created: admin / admin123')
else:
    print('Superuser already exists')

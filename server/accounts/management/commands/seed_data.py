from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from academics.models import Level, ClassLevel, Subject, Teacher
from holidays.models import HolidayPackage
from news_events.models import News, Event
from campus_life.models import Club, Sport
from contact.models import SchoolInfo
import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Create Superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@gsnkombo.edu',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='headmaster'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        
        # Create Headmaster
        if not User.objects.filter(username='headmaster').exists():
            User.objects.create_superuser(
                username='headmaster',
                email='headmaster@gsnkombo.edu',
                password='headmaster123',
                first_name='John',
                last_name='Doe',
                role='headmaster'
            )
        
        # Create DOS
        if not User.objects.filter(username='dos').exists():
            User.objects.create_user(
                username='dos',
                email='dos@gsnkombo.edu',
                password='dos123',
                first_name='Jane',
                last_name='Smith',
                role='dos'
            )
        
        # Create Levels
        o_level, _ = Level.objects.get_or_create(name="O-Level", description="Ordinary Level (S1-S3)")
        a_level, _ = Level.objects.get_or_create(name="A-Level", description="Advanced Level (S4-S6)")
        
        # Create Classes
        classes_data = [
            ('S1', o_level), ('S2', o_level), ('S3', o_level),
            ('S4', a_level), ('S5', a_level), ('S6', a_level),
        ]
        for name, level in classes_data:
            ClassLevel.objects.get_or_create(name=name, level=level)
        
        # Create Subjects
        subjects = [
            ('Mathematics', 'MATH', o_level),
            ('English', 'ENG', o_level),
            ('Science', 'SCI', o_level),
            ('History', 'HIST', a_level),
            ('Geography', 'GEO', a_level),
            ('Economics', 'ECON', a_level),
        ]
        for name, code, level in subjects:
            Subject.objects.get_or_create(name=name, code=code, level=level)
        
        # Create Holiday Packages
        s2 = ClassLevel.objects.get(name='S2')
        s3 = ClassLevel.objects.get(name='S3')
        admin_user = User.objects.get(username='admin')
        
        holidays = [
            ('April Holiday Package', 'Holiday assignments and revision materials for S2 students.', s2, 2026, 1, '2.4 MB'),
            ('May Holiday Work', 'Questions and activities to keep you learning during the break.', s2, 2026, 1, '1.8 MB'),
            ('June Holiday Revision', 'Comprehensive revision materials for Term 1 topics.', s2, 2026, 1, '3.1 MB'),
            ('March Holiday Package', 'Study materials for S3 students during the break.', s3, 2026, 1, '2.8 MB'),
        ]
        for title, desc, cls, year, term, size in holidays:
            HolidayPackage.objects.get_or_create(
                title=title, class_level=cls, year=year, term=term,
                defaults={'description': desc, 'file_size': size, 'uploaded_by': admin_user}
            )
        
        # Create News
        news_items = [
            ('New Library Opened', 'GS Nkombo proudly announces the opening of a new state-of-the-art library facility.', 'general'),
            ('Sports Day Results', 'Congratulations to all participants in the annual Sports Day event.', 'sports'),
            ('Exam Schedule Released', 'The examination schedule for Term 2 has been released. Check the notice board.', 'academic'),
        ]
        for title, content, category in news_items:
            News.objects.get_or_create(title=title, defaults={'content': content, 'category': category})
        
        # Create Events
        events = [
            ('Sports Day', 'Annual school sports competition', '2026-05-24', 'School Field'),
            ('Parents Meeting', 'Term 2 parents-teacher conference', '2026-06-15', 'Main Hall'),
            ('Award Ceremony', 'Annual academic awards ceremony', '2026-07-01', 'Auditorium'),
        ]
        for title, desc, date, location in events:
            Event.objects.get_or_create(
                title=title, 
                defaults={'description': desc, 'date': date, 'location': location}
            )
        
        # Create Clubs
        clubs = ['Debate Club', 'ICT Club', 'Science Club', 'Drama Club']
        for name in clubs:
            Club.objects.get_or_create(name=name, defaults={'description': f'{name} at GS Nkombo'})
        
        # Create Sports
        sports = ['Football', 'Volleyball', 'Basketball', 'Athletics']
        for name in sports:
            Sport.objects.get_or_create(name=name, defaults={'description': f'{name} at GS Nkombo'})
        
        # Create School Info
        SchoolInfo.objects.get_or_create(
            name='GS Nkombo',
            defaults={
                'slogan': 'Inspiring Minds. Shaping Futures.',
                'address': '123 Education Road, Kampala, Uganda',
                'phone': '+256 700 123 456',
                'email': 'info@gsnkombo.edu',
            }
        )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data!'))
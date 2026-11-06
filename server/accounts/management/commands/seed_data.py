"""Seed the database with realistic starter data for Lycée de Nyanza."""

import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from academics.models import Department, Program, Subject, Teacher
from campus_life.models import CampusEvent, Club, Facility
from contact.models import ContactInfo
from holidays.models import Holiday
from news_events.models import NewsArticle

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with initial data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # ------------------------------------------------------------------ users
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@lyceedenyanza.rw",
                "first_name": "Admin",
                "last_name": "User",
                "role": "headmaster",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin user"))

        staff, created = User.objects.get_or_create(
            username="dos",
            defaults={
                "email": "dos@lyceedenyanza.rw",
                "first_name": "Jane",
                "last_name": "Mukamana",
                "role": "dos",
            },
        )
        if created:
            staff.set_password("dos123")
            staff.save()

        teacher_user, created = User.objects.get_or_create(
            username="teacher",
            defaults={
                "email": "teacher@lyceedenyanza.rw",
                "first_name": "Peter",
                "last_name": "Habimana",
                "role": "teacher",
            },
        )
        if created:
            teacher_user.set_password("teacher123")
            teacher_user.save()

        student_user, created = User.objects.get_or_create(
            username="student",
            defaults={
                "email": "student@lyceedenyanza.rw",
                "first_name": "Aline",
                "last_name": "Uwase",
                "role": "student",
            },
        )
        if created:
            student_user.set_password("student123")
            student_user.save()

        # ------------------------------------------------------------ departments
        departments_data = {
            "ICT": "Software development, networking, multimedia and computer systems.",
            "Construction": "Building construction and technical drawing.",
            "Automobile": "Automobile mechanics and vehicle technology.",
            "Business & Services": "Tourism, hospitality and food & beverage operations.",
        }
        departments = {}
        for name, description in departments_data.items():
            department, _ = Department.objects.get_or_create(
                name=name, defaults={"description": description}
            )
            departments[name] = department

        # --------------------------------------------------------------- programs
        programs_data = [
            ("Software Development", "ICT"),
            ("Networking & Internet Technology", "ICT"),
            ("Multimedia Production", "ICT"),
            ("Computer System & Architecture", "ICT"),
            ("Electronics & Telecommunications", "ICT"),
            ("Automobile Technology", "Automobile"),
            ("Building Construction", "Construction"),
            ("Electrical Technology", "Construction"),
            ("Tourism", "Business & Services"),
            ("Food & Beverage Operations", "Business & Services"),
        ]
        programs = {}
        for name, department_name in programs_data:
            program, _ = Program.objects.get_or_create(
                name=name,
                defaults={
                    "department": departments[department_name],
                    "level": "secondary",
                    "description": f"{name} is offered at L3, L4 and L5 level.",
                },
            )
            programs[name] = program

        # ----------------------------------------------------------- teacher record
        teacher, _ = Teacher.objects.get_or_create(
            user=teacher_user,
            defaults={
                "employee_id": "LDN-T-001",
                "department": departments["ICT"],
                "qualification": "BSc Computer Science",
                "hire_date": datetime.date(2021, 9, 1),
            },
        )

        # --------------------------------------------------------------- subjects
        subjects_data = [
            ("Mathematics", "MATH-01", "ICT", "Software Development"),
            ("Physics", "PHY-01", "ICT", "Electronics & Telecommunications"),
            ("Computer Programming", "ICT-01", "ICT", "Software Development"),
            ("Networking Essentials", "ICT-02", "ICT", "Networking & Internet Technology"),
            ("Technical Drawing", "CON-01", "Construction", "Building Construction"),
            ("Entrepreneurship", "BUS-01", "Business & Services", "Tourism"),
        ]
        for name, code, department_name, program_name in subjects_data:
            Subject.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "department": departments[department_name],
                    "program": programs[program_name],
                    "credits": 3,
                },
            )

        # -------------------------------------------------------------- holidays
        holidays_data = [
            ("Term 1 Holidays", datetime.date(2024, 12, 20), datetime.date(2025, 1, 5)),
            ("Term 2 Holidays", datetime.date(2025, 4, 12), datetime.date(2025, 5, 4)),
            ("Independence Day", datetime.date(2025, 7, 1), datetime.date(2025, 7, 1)),
            ("Term 3 Holidays", datetime.date(2025, 11, 21), datetime.date(2026, 1, 4)),
        ]
        for name, start, end in holidays_data:
            Holiday.objects.get_or_create(
                name=name,
                defaults={
                    "start_date": start,
                    "end_date": end,
                    "description": f"{name} at Lycée de Nyanza.",
                    "is_national": name == "Independence Day",
                },
            )

        # ------------------------------------------------------------------ news
        news_data = [
            (
                "Admission for the 2025–2026 Academic Year is Open",
                "Applications for the new academic year are now open. Visit the admissions "
                "page for requirements and submit your application online.",
                "announcement",
                datetime.datetime(2025, 4, 25, 9, 0, tzinfo=datetime.timezone.utc),
            ),
            (
                "Career Guidance Session for Our Students",
                "Our students took part in a career guidance session covering TVET pathways, "
                "internships and entrepreneurship.",
                "news",
                datetime.datetime(2025, 4, 15, 9, 0, tzinfo=datetime.timezone.utc),
            ),
            (
                "Celebrating Excellence at Lycée de Nyanza",
                "We celebrated our top performing students and their teachers at the end of "
                "term award ceremony.",
                "achievement",
                datetime.datetime(2025, 4, 10, 9, 0, tzinfo=datetime.timezone.utc),
            ),
        ]
        for title, content, category, published in news_data:
            article, created = NewsArticle.objects.get_or_create(
                title=title,
                defaults={
                    "content": content,
                    "excerpt": content[:180],
                    "author": admin,
                    "category": category,
                },
            )
            if created:
                article.is_published = True
                article.published_date = published
                article.save()

        # --------------------------------------------------------- campus events
        events_data = [
            ("Sports Day", "Annual inter-class sports competition.", datetime.date(2025, 5, 24), "sports"),
            ("Parents Meeting", "Term 2 parents and teachers meeting.", datetime.date(2025, 6, 15), "social"),
            ("Award Ceremony", "Annual academic awards ceremony.", datetime.date(2025, 7, 1), "academic"),
        ]
        for title, description, date, event_type in events_data:
            CampusEvent.objects.get_or_create(
                title=title,
                defaults={
                    "description": description,
                    "event_date": date,
                    "event_type": event_type,
                    "created_by": admin,
                },
            )

        # ------------------------------------------------------------- facilities
        facilities_data = [
            ("Computer Lab", "Modern computer laboratory with high speed internet.", 40),
            ("Workshop", "Technical workshop for automobile and construction practice.", 30),
            ("Multimedia Studio", "Studio for video, audio and photography production.", 20),
            ("Science Laboratory", "Physics, chemistry and biology practical laboratory.", 35),
            ("Library", "Library and quiet study space with digital resources.", 60),
        ]
        for name, description, capacity in facilities_data:
            Facility.objects.get_or_create(
                name=name,
                defaults={"description": description, "capacity": capacity},
            )

        # ------------------------------------------------------------------ clubs
        clubs_data = [
            ("ICT Club", "Coding, robotics and ICT competitions.", "Mon & Wed 4pm"),
            ("Debate Club", "Public speaking and debate practice.", "Tue 4pm"),
            ("Science Club", "Experiments, projects and science fairs.", "Thu 4pm"),
            ("Drama Club", "Theatre, dance and cultural performances.", "Fri 4pm"),
        ]
        for name, description, schedule in clubs_data:
            Club.objects.get_or_create(
                name=name,
                defaults={
                    "description": description,
                    "meeting_schedule": schedule,
                    "advisor": teacher,
                },
            )

        # ------------------------------------------------------------ contact info
        ContactInfo.objects.get_or_create(
            school_name="Lycée de Nyanza",
            defaults={
                "address": "Nyanza District, Southern Province, Rwanda",
                "phone": "+250 788 123 456",
                "email": "info@lyceedenyanza.rw",
                "working_hours": "Monday - Friday, 7:30 - 17:00",
                "latitude": -2.3514,
                "longitude": 29.7511,
            },
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded data!"))

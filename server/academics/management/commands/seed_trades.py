"""Seed the TVET trades, their L3-L5 curriculum and the teaching teams.

Run on its own with ``python manage.py seed_trades`` (``seed_data`` calls it too).
Safe to run repeatedly: trades are matched by slug and teachers by employee id.
"""

import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from academics.models import Program, Teacher, Trade

User = get_user_model()

TRADES = [
    {
        "code": "SOD",
        "program": "Software Development",
        "slug": "software-development",
        "icon": "code",
        "image": "/images/campus-lab.jpg",
        "tagline": "Build the applications Rwanda runs on",
        "summary": "Learn to design, code and ship real software — from your first web page to a full database-driven application.",
        "description": (
            "Software Development is one of the flagship trades at Lycée de Nyanza. Students spend most of "
            "their week in the computer lab, working on live projects in small teams: school management tools, "
            "mobile-first websites, simple games and data dashboards. Alongside the code, the trade teaches "
            "version control, testing, documentation and the professional habits employers expect."
        ),
        "entry_requirements": (
            "Senior 3 (or L3 entry) with a pass in Mathematics and English. No previous coding experience is "
            "required — students who bring a laptop of their own are encouraged to do so."
        ),
        "career_paths": [
            "Junior web developer",
            "Mobile application developer",
            "QA / test technician",
            "Freelance software consultant",
            "Entrepreneur building digital products",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Foundations of computing & programming",
                "modules": [
                    "Computer fundamentals and operating systems",
                    "Programming logic with Python",
                    "HTML, CSS and responsive layout",
                    "Professional conduct and workplace safety",
                ],
            },
            {
                "level": "L4",
                "title": "Application development",
                "modules": [
                    "Object-oriented programming with JavaScript",
                    "Databases and SQL modelling",
                    "Front-end frameworks and component design",
                    "Team projects with Git and code review",
                ],
            },
            {
                "level": "L5",
                "title": "Professional practice & specialisation",
                "modules": [
                    "Back-end APIs and authentication",
                    "Software testing, deployment and maintenance",
                    "Capstone project with a real client",
                    "Internship preparation and portfolio building",
                ],
            },
        ],
    },
    {
        "code": "NIT",
        "program": "Networking & Internet Technology",
        "slug": "networking-internet-technology",
        "icon": "network",
        "image": "/images/campus-lab.jpg",
        "tagline": "Keep Rwanda connected",
        "summary": "Design, install and secure the networks that every school, bank and office depends on.",
        "description": (
            "Networking & Internet Technology trains students to build and maintain the physical and wireless "
            "networks behind modern organisations. The trade lab holds routers, switches, structured cabling "
            "kits and a small server rack, so learners practice on real equipment rather than diagrams alone."
        ),
        "entry_requirements": (
            "Senior 3 (or L3 entry) with a pass in Mathematics and Physics. Curiosity about how the internet works matters more than prior experience."
        ),
        "career_paths": [
            "Network technician",
            "IT support and help-desk officer",
            "Wireless and ISP field engineer",
            "Systems administrator",
            "Cybersecurity operations assistant",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Network fundamentals",
                "modules": [
                    "Cabling, connectors and structured wiring",
                    "IP addressing and subnetting",
                    "Network devices and topologies",
                    "Electrical safety in technical rooms",
                ],
            },
            {
                "level": "L4",
                "title": "Routing, switching and services",
                "modules": [
                    "Router and switch configuration",
                    "Wireless network planning",
                    "Server services: DHCP, DNS, file sharing",
                    "Network monitoring and troubleshooting",
                ],
            },
            {
                "level": "L5",
                "title": "Security and operations",
                "modules": [
                    "Firewalls, VPNs and access control",
                    "Network security auditing",
                    "Cloud and ISP service delivery",
                    "Capstone: design a campus network",
                ],
            },
        ],
    },
    {
        "code": "CSA",
        "program": "Computer System & Architecture",
        "slug": "computer-system-architecture",
        "icon": "monitor",
        "image": "/images/campus-lab.jpg",
        "tagline": "Know every part inside the machine",
        "summary": "Assemble, diagnose and repair computers and embedded systems — the hardware side of the digital economy.",
        "description": (
            "Computer System & Architecture is a hands-on hardware trade. Students learn how a computer is put "
            "together, how components talk to each other, and how to diagnose faults methodically. The workshop "
            "is stocked with working test benches, spare components and diagnostic tools."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in Mathematics and Physics.",
        "career_paths": [
            "Computer repair technician",
            "Hardware sales and support specialist",
            "Embedded systems assembler",
            "Maintenance officer in a data centre",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Hardware essentials",
                "modules": [
                    "Computer components and assembly",
                    "Operating system installation",
                    "Electronics fundamentals",
                    "Workshop safety and tool care",
                ],
            },
            {
                "level": "L4",
                "title": "Diagnostics and systems",
                "modules": [
                    "Fault finding with diagnostic tools",
                    "Storage, memory and power systems",
                    "Microcontrollers and sensors",
                    "Preventive maintenance planning",
                ],
            },
            {
                "level": "L5",
                "title": "Advanced systems",
                "modules": [
                    "Embedded system programming",
                    "Server hardware and virtualisation",
                    "Repair business and customer care",
                    "Capstone: rebuild a lab from scratch",
                ],
            },
        ],
    },
    {
        "code": "MMP",
        "program": "Multimedia Production",
        "slug": "multimedia-production",
        "icon": "video",
        "image": "/images/studio.jpg",
        "tagline": "Tell Rwanda's stories in sound and picture",
        "summary": "Shoot, edit and publish professional video, photography and graphics from the school's own studio.",
        "description": (
            "Multimedia Production combines creative craft with technical discipline. Students learn camera work, "
            "lighting, sound and editing on the school's studio equipment, then publish their work through the "
            "school's channels and for real clients in Nyanza."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in English and Art or Literature.",
        "career_paths": [
            "Video editor and colourist",
            "Photographer / videographer",
            "Graphic designer",
            "Social media content producer",
            "Sound technician",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Creative foundations",
                "modules": [
                    "Camera operation and composition",
                    "Design principles and typography",
                    "Audio recording basics",
                    "Storytelling and script writing",
                ],
            },
            {
                "level": "L4",
                "title": "Production craft",
                "modules": [
                    "Lighting for studio and location",
                    "Video editing and post-production",
                    "Graphic design with industry tools",
                    "Client briefs and production planning",
                ],
            },
            {
                "level": "L5",
                "title": "Professional production",
                "modules": [
                    "Motion graphics and visual effects",
                    "Broadcast and streaming workflows",
                    "Portfolio, pricing and freelancing",
                    "Capstone: a documentary short",
                ],
            },
        ],
    },
    {
        "code": "AUT",
        "program": "Automobile Technology",
        "slug": "automobile-technology",
        "icon": "car",
        "image": "/images/workshop.jpg",
        "tagline": "Keep the country's vehicles on the road",
        "summary": "Service, diagnose and repair modern vehicles in a workshop that mirrors a real garage.",
        "description": (
            "Automobile Technology is taught in a working garage on campus, with engine benches, lifting "
            "equipment and diagnostic scanners. Students progress from basic servicing to engine overhaul, "
            "electrical fault-finding and hybrid vehicle awareness."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in Mathematics and Physics.",
        "career_paths": [
            "Automotive mechanic",
            "Vehicle electrical technician",
            "Fleet maintenance officer",
            "Garage owner / entrepreneur",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Vehicle basics",
                "modules": [
                    "Engine principles and components",
                    "Servicing and lubrication",
                    "Workshop tools and safety",
                    "Technical drawing and measurement",
                ],
            },
            {
                "level": "L4",
                "title": "Systems and diagnostics",
                "modules": [
                    "Brakes, suspension and steering",
                    "Vehicle electrical systems",
                    "Engine management and scanning",
                    "Customer service in a garage",
                ],
            },
            {
                "level": "L5",
                "title": "Advanced repair",
                "modules": [
                    "Engine overhaul and transmission work",
                    "Air conditioning and comfort systems",
                    "Hybrid and electric vehicle awareness",
                    "Capstone: full vehicle inspection",
                ],
            },
        ],
    },
    {
        "code": "ELT",
        "program": "Electrical Technology",
        "slug": "electrical-technology",
        "icon": "zap",
        "image": "/images/workshop.jpg",
        "tagline": "Power homes, schools and industry",
        "summary": "Install and maintain safe electrical systems, from domestic wiring to solar and industrial panels.",
        "description": (
            "Electrical Technology covers the whole journey of electricity from generation to the socket on the "
            "wall. Students work on wiring rigs, motor control panels and a solar installation on campus, always "
            "with a strong emphasis on safety standards."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in Mathematics and Physics.",
        "career_paths": [
            "Electrician (domestic and industrial)",
            "Solar PV installer",
            "Electrical maintenance technician",
            "Panel builder",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Electrical fundamentals",
                "modules": [
                    "Electrical theory and measurement",
                    "Domestic wiring installation",
                    "Safety, earthing and protection",
                    "Hand tools and conduit work",
                ],
            },
            {
                "level": "L4",
                "title": "Installation practice",
                "modules": [
                    "Three-phase systems",
                    "Motor starting and control",
                    "Solar PV installation",
                    "Reading electrical drawings",
                ],
            },
            {
                "level": "L5",
                "title": "Industrial systems",
                "modules": [
                    "Industrial automation basics",
                    "Fault finding and testing",
                    "Energy efficiency and auditing",
                    "Capstone: wire a building to code",
                ],
            },
        ],
    },
    {
        "code": "BDC",
        "program": "Building Construction",
        "slug": "building-construction",
        "icon": "building",
        "image": "/images/school-building.jpg",
        "tagline": "Build what the next generation will use",
        "summary": "From setting out a site to finishing a structure — the practical construction skills Rwanda needs.",
        "description": (
            "Building Construction teaches the full sequence of a small building project: reading drawings, "
            "setting out, masonry, concrete work and finishes. Students build real structures on campus each "
            "year, working alongside qualified site supervisors."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in Mathematics and Physics.",
        "career_paths": [
            "Mason / site technician",
            "Construction supervisor",
            "Quantity surveying assistant",
            "Small contractor",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Construction basics",
                "modules": [
                    "Technical drawing and reading plans",
                    "Materials and their properties",
                    "Site safety and PPE",
                    "Basic masonry",
                ],
            },
            {
                "level": "L4",
                "title": "Building practice",
                "modules": [
                    "Setting out and levelling",
                    "Concrete mixing and reinforcement",
                    "Roofing and carpentry basics",
                    "Cost estimation",
                ],
            },
            {
                "level": "L5",
                "title": "Project delivery",
                "modules": [
                    "Finishes: plaster, tiles and paint",
                    "Project planning and supervision",
                    "Quality control and inspection",
                    "Capstone: build a small structure",
                ],
            },
        ],
    },
    {
        "code": "ETE",
        "program": "Electronics & Telecommunications",
        "slug": "electronics-telecommunications",
        "icon": "radio",
        "image": "/images/campus-lab.jpg",
        "tagline": "The hardware behind every call and signal",
        "summary": "Work with circuits, sensors and telecoms equipment that keep mobile and broadcast networks alive.",
        "description": (
            "Electronics & Telecommunications blends circuit theory with real telecoms infrastructure. Students "
            "build and test circuits, learn about antennas, fibre and mobile networks, and maintain the "
            "equipment that keeps institutions connected."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in Mathematics and Physics.",
        "career_paths": [
            "Electronics technician",
            "Telecoms field engineer",
            "Fibre and antenna installer",
            "Repair and maintenance specialist",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Circuit foundations",
                "modules": [
                    "Analogue electronics",
                    "Soldering and circuit assembly",
                    "Measuring instruments",
                    "Digital logic basics",
                ],
            },
            {
                "level": "L4",
                "title": "Communications systems",
                "modules": [
                    "Digital electronics and microcontrollers",
                    "Antennas and signal propagation",
                    "Fibre optics installation",
                    "Telecoms power systems",
                ],
            },
            {
                "level": "L5",
                "title": "Networks and maintenance",
                "modules": [
                    "Mobile network architecture",
                    "Broadcast and radio equipment",
                    "Fault finding on telecoms sites",
                    "Capstone: commission a small network",
                ],
            },
        ],
    },
    {
        "code": "TOR",
        "program": "Tourism",
        "slug": "tourism",
        "icon": "briefcase",
        "image": "/images/campus-study.jpg",
        "tagline": "Share Nyanza and Rwanda with the world",
        "summary": "Guiding, hospitality and tour operations for one of the fastest-growing sectors in Rwanda.",
        "description": (
            "Tourism prepares students for work in hotels, tour operators and cultural sites — including Nyanza's "
            "own royal heritage. The trade mixes languages, customer service and practical guiding with "
            "field visits to museums and hospitality partners."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in English and Geography.",
        "career_paths": [
            "Tour guide",
            "Hotel front-office agent",
            "Travel and tour operations assistant",
            "Cultural heritage interpreter",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Tourism essentials",
                "modules": [
                    "Introduction to tourism and hospitality",
                    "Professional English and French",
                    "Customer care",
                    "Geography of Rwanda",
                ],
            },
            {
                "level": "L4",
                "title": "Guiding and operations",
                "modules": [
                    "Tour guiding techniques",
                    "Ticketing and reservations",
                    "Cultural heritage of Nyanza",
                    "Health, safety and hygiene",
                ],
            },
            {
                "level": "L5",
                "title": "Management and enterprise",
                "modules": [
                    "Tour operations management",
                    "Marketing and digital presence",
                    "Entrepreneurship in tourism",
                    "Capstone: design a tour package",
                ],
            },
        ],
    },
    {
        "code": "FBO",
        "program": "Food & Beverage Operations",
        "slug": "food-beverage-operations",
        "icon": "utensils",
        "image": "/images/campus-study.jpg",
        "tagline": "Professional kitchens start here",
        "summary": "Culinary arts, food safety and service — trained in the school's teaching kitchen and restaurant.",
        "description": (
            "Food & Beverage Operations runs in a teaching kitchen with a small training restaurant. Students "
            "learn cooking techniques, baking, food hygiene and front-of-house service, then cater school events "
            "under supervision."
        ),
        "entry_requirements": "Senior 3 (or L3 entry) with a pass in Biology or Home Economics.",
        "career_paths": [
            "Commis chef",
            "Baker / pastry assistant",
            "Restaurant service supervisor",
            "Catering entrepreneur",
        ],
        "curriculum": [
            {
                "level": "L3",
                "title": "Kitchen foundations",
                "modules": [
                    "Food hygiene and safety (HACCP)",
                    "Knife skills and mise en place",
                    "Basic cooking methods",
                    "Kitchen equipment care",
                ],
            },
            {
                "level": "L4",
                "title": "Culinary craft",
                "modules": [
                    "Rwandan and international cuisine",
                    "Baking and pastry",
                    "Menu planning and costing",
                    "Restaurant service",
                ],
            },
            {
                "level": "L5",
                "title": "Operations and enterprise",
                "modules": [
                    "Food and beverage management",
                    "Stock control and purchasing",
                    "Event catering",
                    "Capstone: run a themed dinner",
                ],
            },
        ],
    },
]

# Two to three teachers per trade; the first of each team is the HOD.
TEACHERS = [
    # Software Development
    ("SOD", "Habimana Eric", "Head of Department", True, "MSc Software Engineering, University of Rwanda",
     "L3, L4, L5", "L3 SOD-A, L4 SOD-A, L5 SOD", 11,
     "Eric has spent a decade building school and public-sector systems and now leads the software trade, "
     "coaching student teams through their capstone projects."),
    ("SOD", "Mukamana Diane", "Senior Trainer", False, "BSc Computer Science, University of Rwanda",
     "L3, L4", "L3 SOD-A, L3 SOD-B, L4 SOD-B", 6,
     "Diane teaches programming fundamentals and front-end development, and runs the school's coding club."),
    ("SOD", "Nshimiyimana Patrick", "Trainer", False, "Diploma in Software Development, IPRC Kigali",
     "L3", "L3 SOD-B", 3,
     "Patrick supports first-year students in the lab and maintains the school's internal tools."),
    # Networking
    ("NIT", "Uwera Claudine", "Head of Department", True, "MSc Information Technology, Carnegie Mellon Africa",
     "L4, L5", "L4 NIT, L5 NIT", 9,
     "Claudine leads the networking trade and the campus network upgrade project used as a teaching lab."),
    ("NIT", "Bizimana Yves", "Trainer", False, "BSc Networking, University of Rwanda",
     "L3, L4", "L3 NIT, L4 NIT", 5,
     "Yves teaches routing and switching and coordinates the trade's Cisco-aligned practical sessions."),
    # Computer systems
    ("CSA", "Mugisha Alain", "Head of Department", True, "BSc Computer Engineering, University of Rwanda",
     "L3, L4, L5", "L3 CSA, L4 CSA, L5 CSA", 8,
     "Alain manages the hardware workshop and teaches diagnostics and embedded systems."),
    ("CSA", "Ingabire Josiane", "Trainer", False, "A1 in Computer Systems, Kigali",
     "L3, L4", "L3 CSA, L4 CSA", 4,
     "Josiane runs practical repair clinics where students service real school and community machines."),
    # Multimedia
    ("MMP", "Keza Sandrine", "Head of Department", True, "BA Film & Media, University of Rwanda",
     "L3, L4, L5", "L3 MMP, L4 MMP, L5 MMP", 7,
     "Sandrine runs the multimedia studio and produces the school's documentary series with her students."),
    ("MMP", "Rwema Kevin", "Trainer", False, "Diploma in Multimedia Production, Nyanza",
     "L3, L4", "L3 MMP, L4 MMP", 4,
     "Kevin teaches camera work, lighting and editing, and manages the school's photo archive."),
    # Automobile
    ("AUT", "Ndayisaba Jean Claude", "Head of Department", True, "A1 in Automobile Technology, IPRC Huye",
     "L3, L4, L5", "L3 AUT, L4 AUT, L5 AUT", 14,
     "Jean Claude has worked in garages in Huye and Kigali and leads the automotive workshop."),
    ("AUT", "Uwineza Peace", "Trainer", False, "Diploma in Automobile Engineering, IPRC Huye",
     "L3, L4", "L3 AUT, L4 AUT", 5,
     "Peace teaches vehicle electrical systems and organises the trade's industry visits."),
    # Electrical
    ("ELT", "Hakizimana Emmanuel", "Head of Department", True, "BSc Electrical Engineering, University of Rwanda",
     "L4, L5", "L4 ELT, L5 ELT", 12,
     "Emmanuel supervises the campus solar installation, which doubles as a live teaching rig."),
    ("ELT", "Nyiraneza Beata", "Trainer", False, "A1 in Electrical Installation, Kigali",
     "L3, L4", "L3 ELT, L4 ELT", 6,
     "Beata teaches domestic wiring and safety inspection to the L3 and L4 groups."),
    # Construction
    ("BDC", "Munyakazi Olivier", "Head of Department", True, "BSc Civil Engineering, University of Rwanda",
     "L4, L5", "L4 BDC, L5 BDC", 10,
     "Olivier manages the campus construction projects students build each year as part of their assessment."),
    ("BDC", "Uwamahoro Alice", "Trainer", False, "A1 in Construction, IPRC Kigali",
     "L3, L4", "L3 BDC, L4 BDC", 5,
     "Alice teaches technical drawing, setting out and materials testing."),
    # Electronics & telecoms
    ("ETE", "Twagirimana Fabrice", "Head of Department", True, "MSc Electronics, University of Rwanda",
     "L4, L5", "L4 ETE, L5 ETE", 9,
     "Fabrice leads the electronics laboratory and maintains the campus radio and telecoms equipment."),
    ("ETE", "Mutesi Liliane", "Trainer", False, "BSc Telecommunications, University of Rwanda",
     "L3, L4", "L3 ETE, L4 ETE", 4,
     "Liliane teaches circuit assembly and fibre installation practice."),
    # Tourism
    ("TOR", "Umutoni Clarisse", "Head of Department", True, "MA Tourism Management, University of Rwanda",
     "L3, L4, L5", "L3 TOR, L4 TOR, L5 TOR", 8,
     "Clarisse coordinates the trade's partnerships with Nyanza heritage sites and local hotels."),
    ("TOR", "Gasana Bertrand", "Trainer", False, "BA Hospitality, Kigali",
     "L3, L4", "L3 TOR, L4 TOR", 5,
     "Bertrand teaches guiding practice and professional English and French."),
    # Food & beverage
    ("FBO", "Mukandayisenga Odette", "Head of Department", True, "A1 in Culinary Arts, Kigali",
     "L3, L4, L5", "L3 FBO, L4 FBO, L5 FBO", 13,
     "Odette runs the teaching kitchen and the training restaurant, and has trained chefs now working across Rwanda."),
    ("FBO", "Iradukunda Samuel", "Trainer", False, "Diploma in Food & Beverage, Kigali",
     "L3, L4", "L3 FBO, L4 FBO", 4,
     "Samuel teaches bakery and service, and leads the catering team for school events."),
]

DEFAULT_PASSWORD = "teacher123"


class Command(BaseCommand):
    help = "Seed TVET trades, their curriculum and teaching teams"

    @transaction.atomic
    def handle(self, *args, **options):
        created_trades = 0
        for index, data in enumerate(TRADES):
            program = Program.objects.filter(name=data["program"]).first()
            if program is None:
                self.stdout.write(
                    self.style.WARNING(f"Skipping {data['code']}: program not found")
                )
                continue
            _, created = Trade.objects.update_or_create(
                slug=data["slug"],
                defaults={
                    "program": program,
                    "code": data["code"],
                    "tagline": data["tagline"],
                    "summary": data["summary"],
                    "description": data["description"],
                    "icon": data["icon"],
                    "image": data["image"],
                    "entry_requirements": data["entry_requirements"],
                    "career_paths": data["career_paths"],
                    "curriculum": data["curriculum"],
                    "is_active": True,
                    "order": index,
                },
            )
            created_trades += int(created)

        created_teachers = 0
        for (
            code,
            name,
            title,
            is_hod,
            qualification,
            levels,
            classes,
            years,
            bio,
        ) in TEACHERS:
            trade = Trade.objects.filter(code=code).select_related("program").first()
            if trade is None:
                continue
            first_name, *rest = name.split()
            last_name = " ".join(rest)
            employee_id = f"LDN-{code}-{abs(hash(name)) % 900 + 100}"
            username = f"{first_name.lower()}.{last_name.lower().replace(' ', '')}"
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@lyceedenyanza.rw",
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": "teacher",
                },
            )
            if user_created:
                user.set_password(DEFAULT_PASSWORD)
                user.save()

            defaults = {
                "user": user,
                "department": trade.program.department,
                "qualification": qualification,
                "hire_date": datetime.date.today().replace(year=datetime.date.today().year - min(years, 15)),
                "trade": trade,
                "title": title,
                "is_hod": is_hod,
                "levels": levels,
                "classes": classes,
                "years_experience": years,
                "bio": bio,
                "email": user.email,
                "order": 0 if is_hod else years,
                "is_public": True,
            }
            teacher = Teacher.objects.filter(user=user).first()
            if teacher is None:
                Teacher.objects.create(employee_id=employee_id, **defaults)
                created_teachers += 1
            else:
                for field, value in defaults.items():
                    setattr(teacher, field, value)
                teacher.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Trades ready ({created_trades} created) · teachers ready ({created_teachers} created)"
            )
        )

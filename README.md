# LyceeDeNyanzaWeb

School website for **Lycée de Nyanza** — a premier secondary school in Nyanza District, Southern Province, Rwanda, offering academic and technical programs with excellence in education and discipline.

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Django, Django REST Framework, PostgreSQL/SQLite
- **Media:** Pillow for image processing

## Project Structure

```
LyceeDeNyanzaWeb/
├── client/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── lib/       # Utilities (axios, etc.)
│   │   └── types/     # TypeScript interfaces
│   └── ...
├── server/          # Django application
│   ├── nkombo_backend/
│   ├── accounts/      # User authentication
│   ├── academics/     # Academic programs, departments
│   ├── holidays/      # Holiday management
│   ├── admissions/    # Student admissions
│   ├── campus_life/   # Campus activities & facilities
│   ├── news_events/   # News and events
│   └── contact/       # Contact form & info
└── README.md
```

## Getting Started

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs on http://localhost:3000.

### Backend

Activate the virtual environment with the command for **your** shell — the folder
is `Scripts\` on Windows and `bin/` on macOS/Linux.

**Windows (PowerShell)**

```powershell
cd server
python -m venv venv
.\venv\Scripts\Activate.ps1     # if blocked: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

**Windows (CMD)**

```bat
cd server
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

**macOS / Linux**

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Runs on http://localhost:8000. Check it with http://localhost:8000/api/.

Optional first-time setup:

```bash
python manage.py createsuperuser   # or: python create_admin.py (admin / admin123)
python manage.py seed_data         # sample programs, news, holidays, etc.
```

### API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/` | API index |
| POST | `/api/auth/register/` | Create an account |
| POST | `/api/auth/login/` | Obtain an auth token |
| GET | `/api/auth/profile/` | Current user (token required) |
| GET | `/api/academics/programs/` | Programs (also `departments`, `subjects`, `teachers`) |
| GET | `/api/holidays/` | School holiday periods |
| GET | `/api/holiday-resources/` | Assignments, revision notes and study guides (staff publish) |
| GET | `/api/academics/students/me/` | Signed-in student's profile |
| GET | `/api/academics/grades/mine/` | Signed-in student's results + average |
| GET | `/api/academics/attendance/mine/` | Signed-in student's attendance summary |
| POST | `/api/academics/grades/` | Record a mark (staff) |
| POST | `/api/academics/attendance/` | Mark the register (staff) |
| POST | `/api/admissions/applications/` | Public admission application |
| GET | `/api/admissions/` | Applications list (staff) |
| GET | `/api/news/` | News articles |
| GET | `/api/campus-life/facilities/` | Facilities (also `clubs`, `campus-events`) |
| GET | `/api/contact/info/` | Contact details |
| POST | `/api/contact/messages/` | Public contact message |
| GET | `/api/contact/inbox/` | Messages (staff) |

### Portals

| Portal | URL | Who |
| --- | --- | --- |
| Student | `/dashboard/student` | Results, average, attendance, downloadable holiday resources |
| Teacher | `/dashboard/teacher` | Enter marks, mark the daily register, publish holiday resources |
| DOS / Headmaster | `/dashboard/dos`, `/dashboard/headmaster` | School-wide overview |

Demo accounts created by `python manage.py seed_data`:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin123` | headmaster / superuser |
| `dos` | `dos123` | director of studies |
| `teacher` | `teacher123` | teacher |
| `student` | `student123` | student |

All write access to the API requires a staff account. Public visitors can read the
school's content and submit admission and contact forms, but cannot modify anything.

> Changing `AUTH_USER_MODEL` on an existing development database: if `migrate` complains
> about user tables, delete `db.sqlite3` (`Remove-Item db.sqlite3` on PowerShell) and run
> `python manage.py migrate` again, then recreate your admin user.

## School Information

- **Name:** Lycée de Nyanza
- **Location:** Nyanza District, Southern Province, Rwanda
- **Phone:** +250 788 692 199
- **Email:** info@lyceenyanza.rw
- **Slogan:** Excellence in Education. Building Future Leaders.

## License

Private - Lycée de Nyanza

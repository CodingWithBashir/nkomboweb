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
| GET | `/api/academics/programs/` | Programs (also `departments`, `subjects`) |
| GET | `/api/academics/trades/` | TVET trades with L3-L5 curriculum and teaching team |
| GET | `/api/academics/trades/{slug}/` | One trade, teachers ordered HOD first |
| GET | `/api/academics/teachers/` | Teacher profiles (filter `?trade=`, `?is_hod=`) |
| GET | `/api/academics/teachers/{slug}/` | Single teacher profile |
| POST/PATCH/DELETE | `/api/academics/teachers/` | Admin: add, edit or remove a teacher profile (staff) |
| POST/PATCH/DELETE | `/api/academics/trades/` | Admin: manage trades (staff) |
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
| Teaching staff admin | `/dashboard/headmaster/teachers` | Headmaster/admin: add, edit and remove teacher profiles |

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

## Trades, teachers and the public profile pages

Every trade has its own page at `/academics/{slug}` (for example
`/academics/software-development`) showing its L3, L4 and L5 curriculum, career
paths, entry requirements and teaching team — head of department first. Each
teacher has a profile at `/teachers/{slug}` with their qualification, the classes
they teach, their biography and contact details; `/teachers` lists everybody by
trade.

Content comes from the API and falls back to the bundled snapshot in
`client/src/data/trades.json`, so a build never depends on a running backend.
The public pages revalidate every 10 minutes, so edits made in the dashboard
appear without a redeploy.

### Managing teachers as an administrator

1. Sign in at `/login` with a headmaster or admin account (demo: `admin` / `admin123`).
2. Open **Headmaster → Teaching staff** (`/dashboard/headmaster/teachers`).
3. *Add teacher* creates the login account and the public profile in one step —
   name, trade, role title, qualification, levels, classes, biography and
   whether the profile is visible on the website.
4. *Edit* updates the profile (and renames the login when the name changes);
   the bin icon removes the teacher.

Seeding: `python manage.py seed_trades` fills the ten trades, their curriculum
and 21 teacher profiles (`seed_data` runs it too). Django admin also exposes
`Trade` and `Teacher` at `/admin/`.

## Performance and SEO

- All public pages are statically generated (54 routes at build time), with ISR
  for the API-driven trade and teacher pages.
- Fonts are self-hosted latin woff2 subsets loaded with `next/font`, so there is
  no render-blocking third-party stylesheet and no font swap layout shift.
- `next/image` serves AVIF/WebP with explicit `sizes`, the hero image is
  preloaded, and `/images/*` is cached for a year.
- Each page carries a canonical URL, Open Graph/Twitter cards, and structured
  data: `School`, `WebSite`, `Course`, `Person`, `FAQPage`, `BreadcrumbList` and
  `ItemList`; `sitemap.xml` includes every trade and teacher page.

## School Information

- **Name:** Lycée de Nyanza
- **Location:** Nyanza District, Southern Province, Rwanda
- **Phone:** +250 788 692 199
- **Email:** info@lyceenyanza.rw
- **Slogan:** Excellence in Education. Building Future Leaders.

## License

Private - Lycée de Nyanza

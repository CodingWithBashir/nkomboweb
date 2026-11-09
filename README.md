# LyceeDeNyanzaWeb

School website and portal for **Lycée de Nyanza** — a secondary school in Nyanza
District, Southern Province, Rwanda, offering academic and technical (TVET)
programmes with excellence in education and discipline.

## Tech stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **API:** Next.js route handlers under `/api/**` (no separate backend service)
- **Database:** SQLite via `better-sqlite3` — `client/data/school.db`
- **Accounts:** Supabase Auth (project `Lycée de Nyanza`) — real e-mail/password
  accounts, sessions and password reset
- **Images:** an external image host (imgdb / imgbb API) — only URLs are stored
- **Holiday files:** uploaded to `client/public/uploads`

Everything runs from a single `npm` project, so `npm run dev` starts the website
and the API together.

## Project structure

```
LyceeDeNyanzaWeb/
└── client/
    ├── data/                 # SQLite database (created + seeded on first run)
    ├── public/uploads/       # Uploaded holiday resources
    └── src/
        ├── app/              # App router pages and /api/** route handlers
        ├── components/       # Shared UI (Navbar, Footer, cards, …)
        ├── data/             # Bundled content snapshot (seed fallback)
        └── lib/
            ├── content.ts    # Public content getters used by server components
            └── server/       # API layer: db, auth, http helpers, queries, seed
```

## Getting started

```bash
cd client
npm install
npm run dev          # http://localhost:3000
```

On the first request the API creates `data/school.db`, applies the schema and
seeds it with demo content (10 trades, 21 teachers, a sample student, marks,
attendance, holidays, revision material, news and campus life entries). Seeding
is idempotent: it only runs when the `users` table is empty.

Production build:

```bash
cd client
npm run build
npm run start        # serves the site and the API on port 3000
```

Useful environment variables (all optional):

| Variable | Default | Purpose |
| --- | --- | --- |
| `SCHOOL_DB_PATH` | `client/data/school.db` | Where the SQLite database lives |
| `NEXT_PUBLIC_API_URL` | `/api` | Base URL the browser uses for API calls |

## Accounts

Sign-in is handled by Supabase. Accounts live in the Supabase project, and the
site's API verifies the resulting session (see *How sign-in works* below) before
issuing its own access token.

| Role | E-mail | Password |
| --- | --- | --- |
| Head teacher / admin | `admin@lyceedenyanza.rw` | `Admin@2026` |
| Director of studies | `dos@lyceedenyanza.rw` | `Dos@2026` |
| Teacher (demo) | `teacher@lyceedenyanza.rw` | `Teacher@2026` |
| Student (demo) | `student@lyceedenyanza.rw` | `Student@2026` |
| Any other teacher | `firstname.lastname@lyceedenyanza.rw` | `Nyanza@2026` |

Students and parents can register from the login page; new accounts start with
the student role and an administrator can change it.

### How sign-in works

1. The browser signs in with Supabase (`@supabase/supabase-js`).
2. It calls the `session-bridge` edge function in the same project, which — since
   the platform has already verified the token — returns a short-lived
   assertion signed with `SCHOOL_BRIDGE_SECRET`.
3. `POST /api/auth/supabase/` verifies that assertion (or, if
   `SUPABASE_JWT_SECRET` is set, the access token itself) and returns the school
   token used by every other endpoint.

If Supabase cannot be reached, the login page falls back to the school's local
user directory with the same credentials, so the portal is never locked out.

## API

All endpoints keep the URL, payload and response shape the frontend has always
used: trailing-slash paths, DRF pagination (`{count, next, previous, results}`),
`Authorization: Token <key>` and the same field names.

### Endpoints

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/login/`, `POST /api/auth/register/`, `GET/PATCH /api/auth/profile/` |
| Academics | `/api/academics/{departments,programs,subjects}/`, `/api/academics/trades/<slug>/`, `/api/academics/teachers/<slug>/`, `/api/academics/students/` + `me/`, `/api/academics/grades/` + `mine/`, `/api/academics/attendance/` + `mine/` |
| Holidays | `/api/holidays/`, `/api/holiday-resources/` (multipart upload, download URLs) |
| Admissions | `POST /api/admissions/applications/`, staff list/detail under `/api/admissions/` |
| Contact | `POST /api/contact/messages/`, staff inbox under `/api/contact/inbox/`, `/api/contact/info/` |
| Campus life | `/api/campus-life/{campus-events,facilities,clubs}/` |
| News | `/api/news/`, `/api/news/published/` |

Read endpoints are public; writes require a staff token.

- Head teacher, admin and director of studies manage staff and students.
- Any staff member can add a colleague; teachers edit their own profile.
- `GET /api/academics/students/directory/` is the public student directory.

## Managing content from the dashboard

| Page | What it does |
| --- | --- |
| `/dashboard/headmaster` | Live overview: staff, students, trades, holiday material |
| `/dashboard/headmaster/teachers` | Add teachers, edit profiles, HODs, photos |
| `/dashboard/headmaster/students` | Enrol students, set L3–L5 level, class year, photo |
| `/dashboard/headmaster/settings` | Connect the image host (imgdb / imgbb API key) |

Photos are uploaded straight from the browser to the configured image host;
only the returned URL is saved in the database. Without a key you can paste any
image URL into a photo field.

## Deployment

Deploy `client/` to any Node host (Vercel, Render, a VPS). Make sure the
directory holding `data/school.db` and `public/uploads` is on persistent storage
— both are created automatically but are excluded from version control.

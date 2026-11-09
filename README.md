# LyceeDeNyanzaWeb

School website and portal for **Lycée de Nyanza** — a secondary school in Nyanza
District, Southern Province, Rwanda, offering academic and technical (TVET)
programmes with excellence in education and discipline.

## Tech stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **API:** Next.js route handlers under `/api/**` (no separate backend service)
- **Database:** SQLite via `better-sqlite3` — `client/data/school.db`
- **Auth:** scrypt password hashing with DRF-compatible `Token` authentication
- **Uploads:** files are written to `client/public/uploads`

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

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Head teacher / admin | `admin` | `admin123` |
| Director of studies | `dos` | `dos123` |
| Teacher | `teacher` | `teacher123` |
| Student | `student` | `student123` |

New teachers created from the staff dashboard sign in with the username shown
on their profile and the default password `teacher123`.

## API

All endpoints keep the URL, payload and response shape the frontend has always
used: trailing-slash paths, DRF pagination (`{count, next, previous, results}`),
`Authorization: Token <key>` and the same field names.

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

## Deployment

Deploy `client/` to any Node host (Vercel, Render, a VPS). Make sure the
directory holding `data/school.db` and `public/uploads` is on persistent storage
— both are created automatically but are excluded from version control.

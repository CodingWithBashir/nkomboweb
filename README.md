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

Everything is one Node project — the website **and** its API. There is no
separate `server/` folder any more: the API is served by the same Next.js app
under `/api/**`.

From the repository root:

```bash
npm run setup        # installs the dependencies inside client/
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run setup
npm run build
npm start            # serves the site and the API on port 3000
```

Other helpers:

| Command | What it does |
| --- | --- |
| `npm run doctor` | Checks Node, dependencies, SQLite and the database — run this first if something fails |
| `npm run lint` | Lints the Next.js app |

You can also work inside `client/` directly (`cd client && npm install && npm run dev`);
the root scripts are only a shortcut.

On the first request the API creates `client/data/school.db`, applies the schema
and seeds it (10 trades, 21 teachers, 15 students, marks, attendance, holidays,
revision material, news and campus life). Seeding is idempotent: it only runs
when the `users` table is empty.

### Troubleshooting

**`Cannot find module ...` / "no modules"** — the dependencies are not
installed (they are not committed). Run `npm run setup` from the repository
root, then `npm run doctor`.

**`better-sqlite3` fails to build** — it ships prebuilt binaries for Node 18/20/22
on Windows, macOS and Linux. If npm has to compile it, install the build tools
(Xcode Command Line Tools on macOS, "Desktop development with C++" on Windows,
`apt install build-essential python3` on Debian/Ubuntu) or switch to Node 20 LTS,
then run `npm run setup` again.

**Port 3000 is busy** — `npm start -- --port 3001`, or stop whatever is using it.

**Database starts empty** — delete nothing; it is seeded on the first API call.
`npm run doctor` shows its size and location.

Useful environment variables (all optional):

| Variable | Default | Purpose |
| --- | --- | --- |
| `SCHOOL_DB_PATH` | `client/data/school.db` | Where the SQLite database lives |
| `NEXT_PUBLIC_API_URL` | `/api` | Base URL the browser uses for API calls |
| `IMGBB_API_KEY` | school key | Photo host used by the dashboard |

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

The administration area lives at **`/lyceeadmin`** (head teacher and admin
accounts land there after signing in; the old `/dashboard/headmaster…` URLs
redirect to it).

| Page | What it does |
| --- | --- |
| `/lyceeadmin` | Live overview: staff, students, trades, holiday material |
| `/lyceeadmin/staff` | Add teachers, edit profiles, HODs, photos |
| `/lyceeadmin/students` | Enrol students, set L3–L5 level, class year, photo |
| `/lyceeadmin/settings` | Connect the image host (imgdb / imgbb API key) |

Photos go to the school's **imgbb (imgdb)** account — key
`d5627ba7e34e1c21d5efa513083c3a95`, already wired in
`client/src/lib/server/imageHost.ts` (override with `IMGBB_API_KEY`, or paste a
different key in Dashboard → Settings). The dashboard uploads from the browser
first and, if that request is blocked, relays the file through
`POST /api/images/upload` (staff only). Only the returned URL is stored in the
database, and any photo field also accepts a pasted URL.

## Deployment

Deploy `client/` to any Node host (Vercel, Render, a VPS). Make sure the
directory holding `data/school.db` and `public/uploads` is on persistent storage
— both are created automatically but are excluded from version control.

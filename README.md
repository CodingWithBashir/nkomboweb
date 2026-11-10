# LyceeDeNyanzaWeb

School website and portal for **Lycée de Nyanza** — a secondary school in Nyanza
District, Southern Province, Rwanda, offering academic and technical (TVET)
programmes with excellence in education and discipline.

## Tech stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS — `client/`
- **API:** Node.js + Express, TypeScript — `server/` (its own package, port 4000)
- **Database:** SQLite via Node's built-in `node:sqlite` — `server/data/school.db` (nothing to compile)
- **Accounts:** Supabase Auth (project `Lycée de Nyanza`) — real e-mail/password
  accounts, sessions and password reset
- **Images:** an external image host (imgdb / imgbb API) — only URLs are stored
- **Holiday files:** uploaded to `server/public/uploads`, served at `/uploads/…`

The two run side by side: the website answers on port 3000 and proxies `/api/**`
to the API on port 4000, so the browser only ever talks to one origin.

## Project structure

```
nkomboweb/
├── server/                     # Node.js API (Express + SQLite)
│   ├── src/
│   │   ├── index.ts            # server bootstrap, CORS, /uploads, /health
│   │   ├── api.ts              # every endpoint (auth, academics, news, …)
│   │   └── lib/
│   │       ├── db.ts           # schema + migrations
│   │       ├── sqlite.ts       # thin wrapper over node:sqlite
│   │       ├── seed.ts         # trades, staff, students, sample content
│   │       ├── queries.ts      # row → JSON serialisers
│   │       ├── auth.ts         # scrypt passwords, Token sessions
│   │       ├── supabaseAuth.ts # Supabase session verification
│   │       └── http.ts         # json / error / pagination helpers
│   ├── data/school.db          # database (created + seeded on first run)
│   └── public/uploads/         # uploaded holiday packs
├── client/                     # website (Next.js App Router)
│   ├── src/app/                # pages, /lyceeadmin, /dashboard/*
│   ├── src/components/         # shared UI
│   └── src/lib/                # API client, content loaders, auth helpers
├── scripts/                    # run.mjs (starts both), doctor.mjs (checks env)
└── package.json                # root shortcuts: setup, dev, build, start
```

## Getting started

The project has two packages with their own dependencies:

| Folder | What it is | Runs on |
| --- | --- | --- |
| `server/` | Node.js API (Express + SQLite) | `http://localhost:4000` |
| `client/` | Website and dashboard (Next.js) | `http://localhost:3000` |

Requirements: **Node.js 22.5 or newer** (the database is Node's built-in
SQLite, so no compiler, Python or Visual Studio is needed).

From the repository root:

```bash
npm run setup        # installs server/ and client/ dependencies
npm run dev          # starts the API (4000) and the website (3000)
```

`npm run dev` waits for the API to answer `/health`, then starts Next.js and
keeps both alive (Ctrl+C stops both).

Production build:

```bash
npm run setup
npm run build        # builds the website
npm start           # API on :4000 + website on :3000
```

You can also run the two halves in separate terminals — handy while debugging:

```bash
npm run api          # API only (tsx watch, port 4000)
npm run web          # website only (next dev, port 3000)
```

The API is a normal HTTP service: `curl http://localhost:4000/api/academics/trades/`
works on its own, CORS is open, and `GET /health` reports its status. The
website proxies `/api/**` and `/uploads/**` to it (see `client/next.config.js`),
so the browser never needs to know the API's address. Point the proxy elsewhere
with `API_ORIGIN=https://api.example.com npm start`.

Other helpers:

| Command | What it does |
| --- | --- |
| `npm run doctor` | Checks Node, dependencies, SQLite and the database — run this first if something fails |
| `npm run clean` | Deletes `node_modules` and `client/.next` (add `-- --data` to also wipe the database) |
| `npm run lint` | Lints the Next.js app |

You can also work inside `client/` directly (`cd client && npm install && npm run dev`);
the root scripts are only a shortcut.

On first start the API creates `server/data/school.db`, applies the schema
and seeds it (10 trades, 21 teachers, 15 students, marks, attendance, holidays,
revision material, news and campus life). Seeding is idempotent: it only runs
when the `users` table is empty.

### Troubleshooting

**`Cannot find module ...` / "no modules"** — the dependencies are not
installed (they are not committed). Run `npm run setup` from the repository
root, then `npm run doctor`.

**The website loads but every API call fails** — the API is not running. Start
it with `npm run api`, or use `npm run dev` / `npm start`, which start both.
`curl http://localhost:4000/health` should answer `{"status":"ok"}`.

**`EADDRINUSE: 4000`** — another API instance is alive: `PORT=4100 npm run api`
and `API_ORIGIN=http://127.0.0.1:4100 npm start`.

**`gyp ERR! find VS` / `node-gyp rebuild` on Windows** — you are on an older
checkout that still used the native `better-sqlite3` addon. Pull the latest
`arena/328605ba-nkomboweb`: the database now uses Node's built-in
`node:sqlite`, there are no native modules left, and `npm run setup` needs no
Visual Studio, Python or build tools. If the folder still contains
`server/node_modules/better-sqlite3`, delete `server/node_modules` and run
`npm run setup` again.

**`node:sqlite` not found / "No such built-in module"** — Node is older than
22.5. Install the current LTS or 24 from nodejs.org and re-run `npm run setup`.

**Port 3000 is busy** — `npm start -- --port 3001`, or stop whatever is using it.

**Database starts empty** — delete nothing; it is seeded on the first API call.
`npm run doctor` shows its size and location.

Useful environment variables (all optional):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` (server) | `4000` | Port the API listens on |
| `SCHOOL_DB_PATH` (server) | `server/data/school.db` | Where the SQLite database lives |
| `API_ORIGIN` (client) | `http://127.0.0.1:4000` | Where the website proxies `/api/**` |
| `NEXT_PUBLIC_API_URL` (client) | `/api` | Base URL the browser uses for API calls |
| `IMGBB_API_KEY` (server) | school key | Photo host used by the dashboard |

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

### Admissions

Applicants apply from `/admissions` — no account needed. They choose a trade,
get a reference number straight away (`ADM-2026-0007`) and can check the
decision with it. The admissions office (head teacher, admin, DOS) works the
queue at `/lyceeadmin/admissions`: review the file, add internal notes, accept,
waitlist or refuse it, then press **Enrol as student** — which creates the
student record, the login and the student number in one step.

Students and parents can register from the login page, but **the account cannot
be used until the school accepts it**: `/lyceeadmin/accounts` lists every
request, and accepting or refusing sends the person a message. Signing in
before approval explains that the request is still being reviewed.

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
- Accounts: `GET /api/auth/registrations/` and `POST /api/auth/registrations/:id/approve|reject/`
  (head teacher / DOS); `POST /api/auth/register/` creates a pending account.
- Messages: `GET /api/notifications/` (own), `POST /api/notifications/:id/read/`.
- Admissions: `POST /api/admissions/applications/` (public), `GET|PATCH|DELETE
  /api/admissions/applications/:id/` and `GET …/stats/` (admissions office only),
  `POST …/:id/enrol/` (creates the student record) and the public
  `GET /api/admissions/applications/status/?reference=ADM-2026-0007`.

### Messages to families

Every decision stores a message for the person concerned — on account approval,
on an application being accepted / waitlisted / refused, and on enrolment (with
the student number). Messages are always visible in the portal and on the
public application-status page; they are also e-mailed when `RESEND_API_KEY`
is set on the API (`server/.env`).

## Managing content from the dashboard

The administration area lives at **`/lyceeadmin`**. It has its own staff
sign-in: visiting it while signed out shows the login form **in place**
(no redirect), and once you are in, every page shares one sidebar with the
whole back office — overview, applications, new accounts, inbox, teaching
staff, students, settings, plus a direct link back to the website. The director
of studies works in the same shell (`/dashboard/dos`). Teachers see only their
own profile; students and parents are told the area is for staff.

Head teacher and admin accounts land on `/lyceeadmin` after signing in; the old
`/dashboard/headmaster…` URLs redirect to it.

| Page | What it does |
| --- | --- |
| `/lyceeadmin` | Live overview: staff, students, applications, trades |
| `/lyceeadmin/admissions` | Online applications: review, notes, accept / waitlist / refuse, enrol |
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

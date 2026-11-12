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
| Attendance | `GET|POST /api/attendance/register/` (whole class, one day), `GET /api/attendance/mine/` |
| Report cards | `GET /api/reports/?student=`, `?trade=&level=` (class ranking), `/api/reports/mine/`, `/api/reports/child/?student=` |
| Fees | `/api/fees/` (totals), `/api/fees/structures/`, `/api/fees/invoices/` + `/:id/payments/`, `/api/fees/payments/`, `/api/fees/students/` (balances), `/api/fees/momo/` |
| Timetable | `GET /api/timetable/week/?trade=&level=` (public), `POST|PATCH|DELETE /api/timetable/:id/` |
| Parents | `GET /api/guardians/children/` (a parent's children, with report, fees), `GET|POST /api/guardians/`, `PATCH|DELETE /api/guardians/:id/` |
| Certificates | `GET /api/certificates/verify/?code=` (public), `/api/certificates/`, `/api/certificates/mine/` |
| Messaging | `GET /api/messages/log/`, `POST /api/messages/` (one number), `POST /api/messages/broadcast/` (a class) |
| System | `GET /api/system/`, `PATCH /api/system/`, `POST /api/system/rollover/`, `/api/audit/`, `GET|POST /api/backup/`, `GET /api/backup/:file/` |

Read endpoints are public; writes require a staff token.

- Head teacher, admin and director of studies manage staff and students.
- Any staff member can add a colleague; teachers edit their own profile.
- `GET /api/academics/students/directory/` is the public student directory.
- Accounts: `GET /api/auth/registrations/` and `POST /api/auth/registrations/:id/approve|reject/`
  (head teacher / DOS); `POST /api/auth/register/` creates a pending account.
- Messages: `GET /api/notifications/` (own), `POST /api/notifications/:id/read/`.
- E-mail: `GET /api/mail/` (provider + counters), `GET /api/mail/outbox/`,
  `GET /api/mail/outbox/:id/`, `POST /api/mail/outbox/:id/resend/`,
  `DELETE /api/mail/outbox/:id/`, `POST /api/mail/test/` (head teacher / DOS).
- Passwords: `POST /api/auth/password/forgot/` (`{email}`) and
  `POST /api/auth/password/reset/` (`{token,password}`).
- Promotions: `GET /api/academics/promotions/?trade=<slug>` (public),
  `POST|PATCH|DELETE /api/academics/promotions/:id/` (head teacher / DOS).
- Re-sending a decision: `POST /api/auth/registrations/:id/email/`.
- Admissions: `POST /api/admissions/applications/` (public), `GET|PATCH|DELETE
  /api/admissions/applications/:id/` and `GET …/stats/` (admissions office only),
  `POST …/:id/enrol/` (creates the student record) and the public
  `GET /api/admissions/applications/status/?reference=ADM-2026-0007`.

### Messages to families

Every decision stores a message for the person concerned — on account approval,
on an application being accepted / waitlisted / refused, and on enrolment (with
the student number) — and the same message is e-mailed to the address the
person gave when they registered. Messages are always visible in the portal and
on the public application-status page.

### E-mail

The portal sends branded letters (navy header, gold button, school footer) for:

| Letter | When it goes out |
| --- | --- |
| *Your account is waiting for approval* | someone registers on `/login` |
| *Your account has been accepted* | the office accepts the registration |
| *…request was not accepted* | the office refuses it, including the optional reason typed in the dialog |
| *New account waiting: …* | the same moment, to every head teacher / DOS inbox |
| Admission decision + enrolment | accepting, waitlisting, refusing, enrolling an application |
| *Reset your … password* | `/forgot-password` |
| *Your password was changed* | after a successful reset |
| *Your … staff account — choose a password* | the office adds a teacher (ticked "e-mail an invitation") — link valid 3 days |
| *New sign-in to your … account* | a staff account signs in from an address never seen before |

**Delivery is optional, the record is not.** With no mail server configured
everything still works: each letter is written to the **outbox** and can be read
and re-sent from `/lyceeadmin/outbox`. Two delivery routes are supported and
tried in this order, so one failing service never stops a family from being
written to:

```ini
# 1 — Resend (already set up in server/.env)
RESEND_API_KEY=re_…

# 2 — the school's own mailbox / SMTP provider, used if Resend fails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lyceedenyanza2018@gmail.com
SMTP_PASS=<app password>
# or the one-line form: smtps://user:pass@smtp.gmail.com:465

MAIL_FROM="Lycée de Nyanza <onboarding@resend.dev>"
MAIL_REPLY_TO=lyceedenyanza2018@gmail.com
```

`server/.env` is read at start-up (and is git-ignored — the key never reaches
the repository). While the domain is not verified in Resend, keep
`MAIL_FROM` on `onboarding@resend.dev`, which only delivers to the address that
owns the Resend account; after verifying `lyceedenyanza.rw` in Resend, switch it
to `no-reply@lyceedenyanza.rw` and any address can receive. `APP_URL` sets the
links inside letters — leave it empty to use the host the office is browsing
from (works in preview/staging), set it once the site is live.

`APP_URL` is used in every link inside a letter, `MAIL_REPLY_TO` sets the reply
address (defaults to the office mailbox). Port 465 uses implicit TLS, 587 starts
in clear text and upgrades with STARTTLS; authentication uses AUTH PLAIN with a
fallback to AUTH LOGIN. The SMTP client is written on `node:net` / `node:tls`, so
there is nothing extra to install and nothing native to compile on Windows.

**`/lyceeadmin/outbox`** shows every attempt with its status — *Delivered*,
*Waiting* (no mail server configured) or *Failed* (with the server's error) —
previews the exact HTML in an iframe, re-sends in one click, deletes old
entries, and sends a test message. The sidebar shows a badge when something
failed. `/lyceeadmin/accounts` shows one chip per registration (*e-mail
delivered* / *waiting* / *failed*), the reason recorded for a refusal, and a
**Send e-mail** button that repeats the decision letter.

**Password reset:** `/forgot-password` → e-mailed link (single use, 30 minutes)
→ `/reset-password?token=…`. Changing the password signs the account out
everywhere and sends a confirmation letter. The answer on `/forgot-password` is
always the same, so the form cannot be used to discover who has an account.

### Promotions (past classes)

Each trade's page ends with **Past promotions**: one card per finished class,
written the way the school writes it — *2025/2026 · Level 3 · SOD* — with the
cover photo, the number of graduates and the whole album behind a click.

The office fills them in at **`/lyceeadmin/promotions`**: pick the trade, type or
tap the year (2025/2026, 2024/2025 …), choose L3 / L4 / L5, upload a cover and
add the rest of the album (upload or paste an imgbb link), say how many graduates
and save. Records can be hidden (draft) or deleted, and are grouped by trade in
the admin list.

| Endpoint | What it does |
| --- | --- |
| `GET /api/academics/promotions/?trade=software-development` | published promotions, optional `year` / `level` filter (public) |
| `GET /api/academics/promotions/?all=true` | includes drafts (head teacher / DOS) |
| `POST /api/academics/promotions/` | add one (`trade_id`, `year`, `level`, `label`, `description`, `cover`, `images[]`, `graduates`, `is_published`) |
| `PATCH` / `DELETE /api/academics/promotions/:id/` | edit (also `is_published` for hide/show) or remove |

Photos go through the same image host as staff photos, so `/lyceeadmin/settings`
still holds the only key. The trade page refreshes within ten minutes of a
change.

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
| `/lyceeadmin/promotions` | Past classes per trade — year, level, graduates and the photo album shown on the trade page |
| `/lyceeadmin/outbox` | Every e-mail the portal sent: preview, resend, test message, delivery status |
| `/lyceeadmin/accounts` | Approve / refuse self-registrations, with an optional reason that is e-mailed |
| `/lyceeadmin/settings` | Connect the image host (imgdb / imgbb API key) and check e-mail delivery |
| `/lyceeadmin/attendance` | One-tap daily register per class; absences e-mail and text the parents |
| `/lyceeadmin/reports` | Bulletins with average, class position, attendance and fee balance — print one or the class, export CSV |
| `/lyceeadmin/timetable` | Weekly grid per trade and level, with subject, teacher and room |
| `/lyceeadmin/fees` | Fee structure, invoices (bill a whole class), cash/MoMo payments, balances, SMS reminders |
| `/lyceeadmin/messages` | SMS and WhatsApp: gateway status, class broadcast, single message, full log |
| `/lyceeadmin/certificates` | Issue a certificate with a number and QR code, copy its verification link, revoke it |
| `/lyceeadmin/audit` | Every change made by staff: who, what, from where |
| `/lyceeadmin/system` | School year and term, end-of-year rollover (with a preview), database backups |

Photos go to the school's **imgbb (imgdb)** account — key
`d5627ba7e34e1c21d5efa513083c3a95`, already wired in
`client/src/lib/server/imageHost.ts` (override with `IMGBB_API_KEY`, or paste a
different key in Dashboard → Settings). The dashboard uploads from the browser
first and, if that request is blocked, relays the file through
`POST /api/images/upload` (staff only). Only the returned URL is stored in the
database, and any photo field also accepts a pasted URL.

## Running the school day

The portal is not only a website: it is the day-to-day tool of the office.

### Attendance

`/lyceeadmin/attendance` loads the class, marks everyone present, and lets the
teacher correct the few who were not — present, absent, late or excused. Saving
writes one row per student for that day. Absent and late students trigger a
message to their guardians (in the portal, by e-mail, and by SMS when a gateway
is configured). The same numbers appear on the report card.

### Report cards and ranking

`/lyceeadmin/reports` turns the marks of a class and term into a bulletin:
subject table with grades, average, position in class, attendance rate and the
remaining fee balance on the same sheet — the way the office already files it.
One bulletin can be printed on its own, the whole class can be printed in one
run, and the class list exports as CSV.

### Fees and MTN MoMo

Create a fee structure once per trade/level/term, then bill a whole class in a
single click. Cash, bank, Airtel and MTN payments are recorded against the
invoice and the status (unpaid → partial → paid) updates itself. When the
`MOMO_*` keys are set, the **MoMo** button on an invoice pushes a payment
request to the parent's phone through the MTN Collections API. Nothing breaks
without the keys: payments are simply recorded by hand.

### Parents

A parent account sees `/portal`: each child's bulletin, attendance and fee
balance, with a print button. Guardians are linked from the console
(`/api/guardians/`); the first link creates the parent account and e-mails a
single-use password link. Demo account: `parent@lyceedenyanza.rw` /
`Parent@2026`.

### Certificates

Issuing a certificate generates a number (`LDN-2026-A1B2C3`), a serial and a QR
code that points at the public page `/verify?code=…`. Employers can check a
certificate without an account; revoking one makes the same page say so.

### Messages, audit, backups

SMS/WhatsApp run on Africa's Talking (or any `SMS_GATEWAY_URL`) and Meta's
Cloud API. Without credentials every message is still stored in the log, so the
office can see exactly what was meant to go out. Every state-changing request
made by staff lands in the audit log. `/lyceeadmin/system` writes a copy of the
SQLite file into `server/data/backups` (last ten kept), and runs the end-of-year
rollover — L3 → L4, L4 → L5, L5 graduates — after showing a preview of how many
students move.

### Environment keys for these features

| Feature | Keys in `server/.env` |
| --- | --- |
| SMS | `AT_API_KEY`, `AT_USERNAME`, `AT_SENDER` or `SMS_GATEWAY_URL` |
| WhatsApp | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` |
| MoMo | `MOMO_SUBSCRIPTION_KEY`, `MOMO_API_USER`, `MOMO_API_KEY`, `MOMO_ENVIRONMENT`, `MOMO_CURRENCY`, `MOMO_CALLBACK_URL` |

All of them are optional — the school side keeps working and nothing is lost.

## Deployment

Deploy `client/` to any Node host (Vercel, Render, a VPS). Make sure the
directory holding `data/school.db` and `public/uploads` is on persistent storage
— both are created automatically but are excluded from version control.

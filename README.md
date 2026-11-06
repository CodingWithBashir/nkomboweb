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

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## School Information

- **Name:** Lycée de Nyanza
- **Location:** Nyanza District, Southern Province, Rwanda
- **Phone:** +250 788 692 199
- **Email:** info@lyceenyanza.rw
- **Slogan:** Excellence in Education. Building Future Leaders.

## License

Private - Lycée de Nyanza

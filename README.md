# NkomboWeb

School website for **GS Nkombo Secondary School**.

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Django, Django REST Framework, PostgreSQL
- **Media:** Pillow for image processing

## Project Structure

```
NkomboWeb/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── lib/       # Utilities (axios, etc.)
│   │   └── types/     # TypeScript interfaces
│   └── ...
├── backend/           # Django application
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
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## License

Private - GS Nkombo Secondary School

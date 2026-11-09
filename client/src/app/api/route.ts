import { json } from '@/lib/server/http';

/** `/api` — a small index of the school API. */
export async function GET() {
  return json({
    message: 'Lycée de Nyanza API is running',
    endpoints: {
      auth: '/api/auth/',
      academics: '/api/academics/',
      holidays: '/api/holidays/',
      holiday_resources: '/api/holiday-resources/',
      admissions: '/api/admissions/',
      campus_life: '/api/campus-life/',
      news: '/api/news/',
      contact: '/api/contact/',
    },
  });
}

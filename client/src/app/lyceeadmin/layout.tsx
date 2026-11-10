import type { Metadata } from 'next';
import AdminGate from '@/components/admin/AdminGate';

export const metadata: Metadata = {
  title: 'Administration — Lycée de Nyanza',
  robots: { index: false, follow: false },
};

/**
 * Every /lyceeadmin page lives inside the administration shell: a sidebar with
 * the whole back office, and — when nobody is signed in — the staff login form
 * right here, instead of bouncing the visitor to /login.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}

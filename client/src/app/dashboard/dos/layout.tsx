import AdminGate from '@/components/admin/AdminGate';

/** The director of studies works inside the same administration shell. */
export default function DosLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}

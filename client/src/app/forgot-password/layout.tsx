import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot your password',
  description: 'Ask the Lycée de Nyanza portal to e-mail you a link to choose a new password.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

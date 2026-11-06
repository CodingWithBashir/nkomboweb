import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lycée de Nyanza - Excellence in Education',
  description: 'Lycée de Nyanza is a premier secondary school in Nyanza District, Rwanda, offering academic and technical programs with excellence in education and discipline.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

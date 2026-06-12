import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GS Nkombo Secondary School - Inspiring Minds. Shaping Futures.',
  description: 'GS Nkombo is a modern, technology-driven secondary school offering quality education, holiday materials, and a complete digital school platform.',
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

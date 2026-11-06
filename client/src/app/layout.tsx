import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lycée de Nyanza | Excellence Through Discipline',
  description:
    'Lycée de Nyanza is a private boarding Technical Secondary School in Nyanza District, Southern Province, Rwanda, offering practical, career-focused TVET education.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

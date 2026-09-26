import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gym Management SaaS',
  description: 'Gym management platform for administrators and gym operators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

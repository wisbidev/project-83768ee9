import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description: 'A focused 25-minute timer with work sessions and breaks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

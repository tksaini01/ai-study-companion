import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'StudyPulse AI — Intelligent Study Companion & Exam Mastery',
  description:
    'Transform your PDF lecture notes into interactive MCQs, 3D active recall flashcards, deep dive concept breakdowns, and personalized 24/7 AI tutoring with Gemini.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <div className="app-atmosphere">
          <div className="glow-orb-1" />
          <div className="glow-orb-2" />
          <div className="glow-orb-3" />
        </div>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

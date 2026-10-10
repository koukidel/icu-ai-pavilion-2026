import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SessionProvider } from '@/context/SessionContext';
import { MobileShell } from '@/components/layout/MobileShell';

export const metadata: Metadata = {
  title: 'ICU AI Pavilion 2026 | AIに、出会い直す。',
  description:
    'ICU FESTIVAL 2026 BLUE ROSE - 人とAIの新しい関係性を探究し、あなただけの箱庭パスポートを持ち帰る体験型パビリオン。',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f6e2ec',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen bg-paper text-ink selection:bg-rose/20 selection:text-ink font-sans">
        <SessionProvider>
          <MobileShell>{children}</MobileShell>
        </SessionProvider>
      </body>
    </html>
  );
}

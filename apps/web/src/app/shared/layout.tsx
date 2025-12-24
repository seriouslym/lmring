import { Toaster } from '@lmring/ui';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/global.css';
import '@/styles/arena.css';

export const metadata: Metadata = {
  title: 'Shared Conversation - LMRing',
  description: 'View a shared conversation from LMRing Arena',
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

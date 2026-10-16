import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import './global.css';

export const metadata: Metadata = {
  title: { default: 'React Quiz Component', template: '%s | React Quiz Component' },
  description: 'Build React quizzes with a ready-made component or headless hooks. Usage, API reference, and interactive examples.',
  icons: {
    icon: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/favicon.ico`, sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
    ],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen"><Provider>{children}</Provider></body>
    </html>
  );
}

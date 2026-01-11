import type { Metadata } from 'next';
import { GlobalErrorHandler } from '@/components/global-error-handler';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Al-Ramy Blog',
  description: 'A modern blog platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <GlobalErrorHandler />
      </body>
    </html>
  );
}

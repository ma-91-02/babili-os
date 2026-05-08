import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/AuthProvider';
import '../styles/globals.scss';

export const metadata: Metadata = {
  title: 'Babili — Smart Restaurant Operations',
  description: 'Smart multilingual restaurant operations from table to kitchen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

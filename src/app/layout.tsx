import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed from GeistSans/GeistMono
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { QueryClientProviderWrapper } from '@/context/query-client-provider';

const inter = Inter({ // Changed from GeistSans
  variable: '--font-inter', // Updated variable name
  subsets: ['latin'],
});

const roboto_mono = Roboto_Mono({ // Changed from GeistMono
  variable: '--font-roboto-mono', // Updated variable name
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VedKarn',
  description: 'Connect with mentors and kickstart your journey with VedKarn.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <QueryClientProviderWrapper>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Correct import
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster"; // Correct path
import { AppLayout } from "@/components/layout/AppLayout"; // Import AppLayout

const geistSans = Geist({ // Initialize Geist Sans
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono is likely not needed if Geist Sans is the primary font
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'WanderWise - AI Travel Planner',
  description: 'Generate personalized travel itineraries with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased font-sans`}> {/* Use Geist Sans variable and font-sans */}
        <AuthProvider>
           <AppLayout>
              {children}
           </AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FronteggAppProvider } from '@frontegg/nextjs/app';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const authOptions = {
  keepSessionAlive: true // Uncomment this in order to maintain the session alive
}

export const metadata: Metadata = {
  title: "App Launcher",
  description: "Launch your apps from one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FronteggAppProvider
          authOptions={authOptions}
          entitlementsOptions={{ enabled: true }}
        >
          {children}
        </FronteggAppProvider>
      </body>
    </html>
  );
}

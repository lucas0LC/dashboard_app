import type { Metadata } from "next";
import React from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}>
        <Navbar/>
        <div className="flex h-[calc(100vh-4rem)]">
          <div className="inline-flex h-full">
            <Sidebar />
          </div>
          <main className="inline-flex overflow-y-auto w-screen justify-center bg-gray-900 h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </body>
    </html>
  );
}

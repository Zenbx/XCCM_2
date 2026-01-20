import type { Metadata } from "next";
import { Poppins, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // choose what you need
});


export const metadata: Metadata = {
  title: "XCCM 2 - L'outil de composition de documents",
  description: "XCCM 2 - L'outil de composition de documents",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ position: 'relative' }}
      >
        <Providers>
          <Header />
          <div className="pt-[60px] lg:pt-[70px]" style={{ position: 'relative' }}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

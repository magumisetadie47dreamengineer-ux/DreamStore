import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { productionSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? productionSiteUrl,
  ),
  title: "DreamStore | Chase the vision. Build the future.",
  description:
    "DreamStore for dream chasers — laptops, gadgets, and gear to build your setup.",
  icons: {
    icon: "/dreamchaser-icon.png",
    apple: "/dreamchaser-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dreamtech"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        {children}
      </body>
    </html>
  );
}

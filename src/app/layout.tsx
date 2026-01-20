import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "GoodNotes Audio Extractor",
  description:
    "Extract audio recordings from your GoodNotes files and download them as a ZIP archive. Free, fast, and works entirely in your browser.",
  keywords: [
    "GoodNotes",
    "audio",
    "extractor",
    "voice recording",
    "notes",
    "mp4",
  ],
  authors: [{ name: "wulukewu" }],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "GoodNotes Audio Extractor",
    description:
      "Extract audio recordings from your GoodNotes files and download them as a ZIP archive.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "UniBot | Intelligent College Explorer",
  description:
    "The intelligent platform for exploring Indian academia, research, cutoffs, and institutional rankings.",
  keywords: [
    "college",
    "rankings",
    "NIRF",
    "India",
    "admissions",
    "chatbot",
    "education",
    "placements",
  ],
  authors: [{ name: "UniBot Team" }],
  openGraph: {
    title: "UniBot | Intelligent College Explorer",
    description:
      "The intelligent platform for exploring Indian academia, research, cutoffs, and institutional rankings.",
    url: "https://unibot.example.com",
    siteName: "UniBot",
    images: [
      {
        url: "/og-image.png", // Ensure this exists in public/
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniBot | Intelligent College Explorer",
    description:
      "The intelligent platform for exploring Indian academia, research, cutoffs, and institutional rankings.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { ChatProvider } from "./context/ChatContext";
import { ShortlistProvider } from "./context/ShortlistContext";
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ShortlistProvider>
            <ChatProvider>{children}</ChatProvider>
          </ShortlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

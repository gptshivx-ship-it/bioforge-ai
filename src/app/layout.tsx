import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioForge — AI Bio Generator for Every Platform",
  description:
    "Generate scroll-stopping bios for LinkedIn, Twitter/X, Instagram, TikTok, and more. Free AI-powered bio generator — stand out in seconds.",
  keywords: [
    "bio generator",
    "AI bio",
    "LinkedIn bio",
    "Twitter bio",
    "Instagram bio",
    "social media bio",
    "professional bio",
  ],
  openGraph: {
    title: "BioForge — AI Bio Generator",
    description: "Generate perfect social media bios in seconds. Free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

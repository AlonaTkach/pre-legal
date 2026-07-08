import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pre-legal · Legal agreement drafter",
  description:
    "Draft and download completed legal agreements through a guided AI chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

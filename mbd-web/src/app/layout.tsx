import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Belly's Diary",
  description: "Get insights on meals potentially affecting your symptoms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

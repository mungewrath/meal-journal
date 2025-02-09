import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal Journal",
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

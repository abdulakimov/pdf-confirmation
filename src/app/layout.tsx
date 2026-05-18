import type { Metadata } from "next";
import { Onest } from "next/font/google";

import "./globals.css";

const onest = Onest({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Document Verification Platform",
  description: "Foundation scaffold for the document verification platform."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={onest.className}>{children}</body>
    </html>
  );
}

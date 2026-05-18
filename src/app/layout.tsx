import type { Metadata } from "next";
import { Onest } from "next/font/google";

import "./globals.css";

const onest = Onest({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Hujjatlarni tasdiqlash platformasi",
  description: "Hujjatlarni tasdiqlash platformasi uchun boshlang'ich asos."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={onest.className}>{children}</body>
    </html>
  );
}

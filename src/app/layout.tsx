import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "Sneha Veed 🏡", template: "%s | Sneha Veed 🏡" },
  description: "Upload embarrassing pics of your friends. Vote. Roast. Survive.",
};

import MobileBottomNav from "@/components/MobileBottomNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <Navbar />
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}

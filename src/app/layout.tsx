import type { Metadata } from "next";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "SMCH - AI Social Engine",
  description: "Multi-account niche brand engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SidebarLayout>{children}</SidebarLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}

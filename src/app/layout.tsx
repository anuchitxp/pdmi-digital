import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PDMI — Post-ACS Care",
  description:
    "Clinician-facing app implementing the Thailand PDMI protocol for post-ACS discharge and follow-up care",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f4c81",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <header className="no-print sticky top-0 z-10 bg-sky-900 text-white shadow">
          <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
            <Link href="/" className="mr-4 text-lg font-bold">
              PDMI
            </Link>
            <nav className="flex flex-wrap gap-1">
              <Link href="/" className="rounded-lg px-3 py-2 text-sm hover:bg-sky-800">
                Dashboard
              </Link>
              <Link href="/patients" className="rounded-lg px-3 py-2 text-sm hover:bg-sky-800">
                Patients
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

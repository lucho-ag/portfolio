import type { Metadata } from "next";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import CRTOverlay from "@/components/CRTOverlay";
import { getSite } from "@/lib/content";
import "./globals.css";

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const site = getSite();

export const metadata: Metadata = {
  title: `${site.name} — ${site.title}`,
  description: site.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${vt323.variable} ${plexMono.variable} antialiased`}>
      <body>
        {children}
        <CRTOverlay />
      </body>
    </html>
  );
}

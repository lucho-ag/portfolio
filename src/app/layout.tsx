import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import CRTOverlay from "@/components/CRTOverlay";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/siteUrl";
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

const title = `${site.name} — ${site.title}`;
const description = `${site.tagline} Portfolio interactivo: proyectos, stack, certificaciones y contacto.`;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: title, template: `%s · ${site.name}` },
  description,
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  // La imagen la genera app/opengraph-image.tsx y Next la agrega sola a og:image y twitter:image.
  openGraph: { type: "website", locale: "es_AR", title, description, siteName: site.name },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#040806", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${vt323.variable} ${plexMono.variable} antialiased`}>
      <body>
        {children}
        <CRTOverlay />
        {/* Vercel Web Analytics: visitas por página. Solo envía datos en el deploy de Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}

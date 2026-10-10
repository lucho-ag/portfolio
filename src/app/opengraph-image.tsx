import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";

/** Imagen al compartir el link (LinkedIn, WhatsApp, X...). Se genera en build. */

const site = getSite();

export const alt = `${site.name} — ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Kenney Pixel (CC0, ver src/assets). Solo mayúsculas y sin acentos: el texto se normaliza a ASCII.
const pixelFont = await readFile(join(process.cwd(), "src/assets/kenpixel.ttf"));
const ascii = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

const VOID = "#040806";
const PHOSPHOR = "#39FF7A";
const PHOSPHOR_DIM = "#1E7A45";
const PHOSPHOR_HOT = "#B8FFC9";

export default async function OpengraphImage() {
  const handle = ascii(site.name.split(" ")[0]).toLowerCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 48,
          background: VOID,
          backgroundImage: "radial-gradient(circle at 50% 40%, #0D1C17 0%, #040806 70%)",
          fontFamily: "Pixel",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: `3px solid ${PHOSPHOR_DIM}` }}>
          {/* Barra de título de la ventana. */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 24px",
              borderBottom: `3px solid ${PHOSPHOR_DIM}`,
              fontSize: 26,
              color: PHOSPHOR,
            }}
          >
            <span>[#] SUBJECT: PORTFOLIO</span>
            <span style={{ color: PHOSPHOR_DIM }}>STATUS: ONLINE</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
            <div style={{ fontSize: 76, color: PHOSPHOR, lineHeight: 1 }}>{ascii(site.name)}</div>
            <div style={{ fontSize: 30, color: PHOSPHOR_HOT, marginTop: 24 }}>{ascii(site.title)}</div>
            <div style={{ fontSize: 22, color: PHOSPHOR_DIM, marginTop: 24, lineHeight: 1.4 }}>{ascii(site.tagline)}</div>
          </div>

          <div style={{ display: "flex", padding: "0 56px 32px", fontSize: 24, color: PHOSPHOR }}>
            <span style={{ color: PHOSPHOR_HOT }}>{`guest@${handle}:~$`}</span>
            <span style={{ marginLeft: 16 }}>./portfolio --start</span>
            <span style={{ marginLeft: 8, color: PHOSPHOR_HOT }}>_</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Pixel", data: pixelFont, style: "normal", weight: 400 }] },
  );
}

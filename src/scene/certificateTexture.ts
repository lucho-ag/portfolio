import type { CanvasTexture } from "three";
import type { SceneDocument } from "./Objects3D";

/** Proporción A4 apaisada. */
export const CERT_WIDTH = 1024;
export const CERT_HEIGHT = Math.round(CERT_WIDTH / Math.SQRT2);

const PAPER = "#CFC6AE";
const INK = "#0D1C17";
const INK_SOFT = "#3E5C55";
const SEAL = "#1E7A45";

/** Familia real de una fuente de next/font (expuesta como variable CSS en <html>). */
function fontFamily(variable: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Dibuja el certificado del documento en el canvas de la textura y la marca para subir a la GPU.
 * Espera a que las fuentes del sitio estén cargadas para no imprimir con la de reserva.
 */
export async function paintCertificate(texture: CanvasTexture, doc: SceneDocument, holder: string) {
  const display = fontFamily("--font-vt323", "monospace");
  const mono = fontFamily("--font-plex-mono", "monospace");
  await Promise.all([document.fonts.load(`48px ${display}`), document.fonts.load(`24px ${mono}`)]);

  const canvas = texture.image as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const W = CERT_WIDTH;
  const H = CERT_HEIGHT;

  // Papel con grano.
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(13, 28, 23, 0.05)";
  for (let i = 0; i < 5000; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);

  // Doble borde y esquinas.
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 10;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, W - 100, H - 100);
  ctx.fillStyle = INK_SOFT;
  for (const [x, y] of [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]]) ctx.fillRect(x - 8, y - 8, 16, 16);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = INK;
  ctx.font = `56px ${display}`;
  ctx.fillText(doc.kind === "CERTIFICATION" ? "CERTIFICATE OF COMPLETION" : "CERTIFICATE OF ACHIEVEMENT", W / 2, 140);

  ctx.fillStyle = INK_SOFT;
  ctx.font = `20px ${mono}`;
  ctx.fillText("THIS DOCUMENT CERTIFIES THAT", W / 2, 190);

  ctx.fillStyle = INK;
  ctx.font = `64px ${display}`;
  ctx.fillText(holder.toUpperCase(), W / 2, 260);
  ctx.fillRect(W / 2 - 220, 275, 440, 2);

  ctx.fillStyle = INK_SOFT;
  ctx.font = `20px ${mono}`;
  ctx.fillText(doc.kind === "CERTIFICATION" ? "HAS SUCCESSFULLY COMPLETED" : "HAS BEEN AWARDED", W / 2, 320);

  // Título (hasta 2 líneas).
  ctx.fillStyle = INK;
  ctx.font = `46px ${display}`;
  const titleLines = wrap(ctx, doc.title.toUpperCase(), W - 220).slice(0, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, W / 2, 380 + i * 48));

  // Emisor o descripción (hasta 2 líneas).
  ctx.fillStyle = INK_SOFT;
  ctx.font = `20px ${mono}`;
  const subY = 380 + titleLines.length * 48 + 10;
  wrap(ctx, doc.subtitle, W - 300)
    .slice(0, 2)
    .forEach((line, i) => ctx.fillText(line, W / 2, subY + i * 28));

  // Fecha con línea de firma.
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `30px ${display}`;
  ctx.fillText(doc.date || "—", 110, H - 110);
  ctx.fillRect(110, H - 100, 220, 2);
  ctx.fillStyle = INK_SOFT;
  ctx.font = `16px ${mono}`;
  ctx.fillText("DATE", 110, H - 76);

  // Sello.
  const sx = W - 180;
  const sy = H - 140;
  ctx.fillStyle = SEAL;
  ctx.beginPath();
  ctx.arc(sx, sy, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(sx, sy, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = PAPER;
  ctx.textAlign = "center";
  ctx.font = `44px ${display}`;
  ctx.fillText("★", sx, sy + 14);

  texture.needsUpdate = true;
}

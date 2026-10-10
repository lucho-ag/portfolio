/**
 * Convierte los clips fuente (media/clips/clipN.mp4) en secuencias WebP para el scroll.
 *
 *   npm run frames              → todos los clips
 *   npm run frames -- clip3     → solo los clips indicados
 *
 * Salida: public/sequences/clipN/0001.webp … (1920 px) y public/sequences/clipN/mobile/ (960 px).
 * Al terminar compara la cantidad de fotogramas con src/sequence/manifest.ts.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const FPS = 12;
const VARIANTS = [
  { dir: "", width: 1920, quality: 78 },
  { dir: "mobile", width: 960, quality: 72 },
];

const root = process.cwd();
const srcDir = path.join(root, "media", "clips");
const outRoot = path.join(root, "public", "sequences");

const requested = process.argv.slice(2);
const clips = readdirSync(srcDir)
  .filter((f) => /^clip\d+\.(mp4|mov|webm)$/i.test(f))
  .map((f) => ({ id: f.replace(/\.\w+$/, ""), file: path.join(srcDir, f) }))
  .filter((c) => requested.length === 0 || requested.includes(c.id))
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

if (clips.length === 0) {
  console.error(`No hay clips en ${srcDir}`);
  process.exit(1);
}

// Cantidad esperada por clip, leída del manifest (sin ejecutar TS).
const manifest = readFileSync(path.join(root, "src", "sequence", "manifest.ts"), "utf8");
const expected = Object.fromEntries(
  [...manifest.matchAll(/id:\s*"(clip\d+)"[^}]*frameCount:\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]),
);

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

for (const clip of clips) {
  for (const v of VARIANTS) {
    const outDir = path.join(outRoot, clip.id, v.dir);
    // Limpia solo los .webp previos (conserva .gitkeep y la subcarpeta mobile).
    if (existsSync(outDir)) {
      for (const f of readdirSync(outDir)) if (f.endsWith(".webp")) rmSync(path.join(outDir, f));
    } else {
      mkdirSync(outDir, { recursive: true });
    }

    execFileSync(
      ffmpeg,
      [
        "-hide_banner", "-loglevel", "error", "-y",
        "-i", clip.file,
        "-vf", `fps=${FPS},scale=${v.width}:-2:flags=lanczos`,
        "-c:v", "libwebp",
        "-quality", String(v.quality),
        "-compression_level", "6",
        "-preset", "picture",
        path.join(outDir, "%04d.webp"),
      ],
      { stdio: "inherit" },
    );

    const frames = readdirSync(outDir).filter((f) => f.endsWith(".webp"));
    const total = frames.reduce((acc, f) => acc + statSync(path.join(outDir, f)).size, 0);
    const label = `${clip.id}${v.dir ? "/" + v.dir : ""}`.padEnd(14);
    const check =
      expected[clip.id] === undefined
        ? "⚠ no está en manifest"
        : expected[clip.id] === frames.length
          ? "✓ manifest"
          : `✗ manifest dice ${expected[clip.id]}`;
    console.log(`${label} ${frames.length} fotogramas  ${kb(total)} total  ~${kb(total / frames.length)}/frame  ${check}`);
  }
}

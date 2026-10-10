import { CLIPS, TOTAL_FRAMES, framePath, type ClipId, type Variant } from "./manifest";

/** Descargas simultáneas de fotogramas. */
const FETCH_CONCURRENCY = 6;
/** Decodificaciones simultáneas (createImageBitmap corre fuera del hilo principal). */
const DECODE_CONCURRENCY = 3;
/** Ventana de fotogramas decodificados alrededor del actual, según la dirección del scroll. */
const AHEAD = 16;
const BEHIND = 6;
/** Margen antes de liberar un bitmap que salió de la ventana (evita decodificar y liberar en loop). */
const EVICT_MARGIN = 4;

/**
 * Almacén de fotogramas en dos niveles:
 * - Blobs comprimidos (WebP, ~50 MB en total): se descargan todos, en orden de clip.
 * - ImageBitmaps decodificados: solo una ventana alrededor del fotograma actual.
 *
 * Decodificar todo no entra en memoria (~8 MB por fotograma) y dejar que el navegador
 * decodifique <img> al dibujar provoca tirones de 10–20 ms en el hilo principal.
 */
class FrameStore {
  private blobs: (Blob | undefined)[] = new Array(TOTAL_FRAMES);
  private bitmaps = new Map<number, ImageBitmap>();
  private decoding = new Set<number>();
  private clipLoads = new Map<ClipId, Promise<void>>();
  private center = 0;
  private direction: 1 | -1 = 1;
  variant: Variant = "desktop";
  /** Ancho de decodificación: no tiene sentido decodificar más píxeles de los que ocupa el canvas. */
  decodeWidth = 1920;

  loadClip(clip: ClipId, onProgress?: (progress: number) => void): Promise<void> {
    const existing = this.clipLoads.get(clip);
    if (existing) return existing;

    let offset = 0;
    for (const c of CLIPS) {
      if (c.id === clip) break;
      offset += c.frameCount;
    }
    const def = CLIPS.find((c) => c.id === clip)!;
    let next = 0;
    let done = 0;

    const worker = async () => {
      while (next < def.frameCount) {
        const local = next++;
        try {
          const res = await fetch(framePath(clip, local, this.variant));
          if (res.ok) this.blobs[offset + local] = await res.blob();
        } catch {
          // Fotograma faltante: se dibuja el más cercano disponible.
        }
        onProgress?.(++done / def.frameCount);
        this.pump();
      }
    };

    const promise = Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker)).then(() => undefined);
    this.clipLoads.set(clip, promise);
    return promise;
  }

  async loadAllInBackground(): Promise<void> {
    for (const c of CLIPS) await this.loadClip(c.id);
  }

  /** Espera a que el fotograma indicado esté decodificado (para el Boot). */
  async warmup(index: number): Promise<void> {
    this.setCenter(index);
    while (!this.bitmaps.has(index) && this.blobs[index]) {
      await new Promise((r) => setTimeout(r, 16));
    }
  }

  /** Clip al que pertenece un fotograma global. */
  private clipOf(index: number): ClipId {
    let start = 0;
    for (const c of CLIPS) {
      if (index < start + c.frameCount) return c.id;
      start += c.frameCount;
    }
    return CLIPS[CLIPS.length - 1].id;
  }

  /**
   * Espera a que un fotograma esté descargado y decodificado (lo usa el HUD antes de mostrar
   * un destino). Si su clip todavía no bajó, lo pide primero. `timeoutMs` evita colgarse.
   */
  async ready(index: number, timeoutMs = 4000): Promise<void> {
    const i = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
    const deadline = performance.now() + timeoutMs;
    const load = this.loadClip(this.clipOf(i));
    await Promise.race([load, new Promise((r) => setTimeout(r, timeoutMs))]);
    this.setCenter(i);
    while (!this.bitmaps.has(i) && performance.now() < deadline) {
      await new Promise((r) => setTimeout(r, 16));
    }
  }

  /**
   * Antes de un recorrido del HUD: se para en `from` mirando en dirección `dir` y espera a que estén
   * listos los primeros fotogramas del trayecto, así la reproducción arranca sin tirones.
   */
  async prime(from: number, dir: 1 | -1, frames = 8, timeoutMs = 1200): Promise<void> {
    const start = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(from)));
    // Un salto al capítulo vecino cruza a lo sumo un clip: alcanza con el actual y el siguiente.
    const ahead = Math.max(0, Math.min(TOTAL_FRAMES - 1, start + dir * CLIPS[0].frameCount));
    const deadline = performance.now() + timeoutMs;
    await Promise.race([
      Promise.all([this.loadClip(this.clipOf(start)), this.loadClip(this.clipOf(ahead))]),
      new Promise((r) => setTimeout(r, timeoutMs)),
    ]);
    this.center = start;
    this.direction = dir;
    this.evict();
    this.pump();
    const needed = Array.from({ length: frames }, (_, k) => start + k * dir).filter((i) => i >= 0 && i < TOTAL_FRAMES);
    while (needed.some((i) => !this.bitmaps.has(i)) && performance.now() < deadline) {
      await new Promise((r) => setTimeout(r, 16));
    }
  }

  /** Lo llama el canvas en cada frame: mueve la ventana de decodificación. */
  setCenter(index: number) {
    const i = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
    if (i !== this.center) this.direction = i > this.center ? 1 : -1;
    this.center = i;
    this.evict();
    this.pump();
  }

  get(index: number): ImageBitmap | undefined {
    return this.bitmaps.get(index);
  }

  getNearest(index: number): ImageBitmap | undefined {
    const exact = this.bitmaps.get(index);
    if (exact) return exact;
    let best: ImageBitmap | undefined;
    let bestDist = Infinity;
    for (const [i, bmp] of this.bitmaps) {
      const d = Math.abs(i - index);
      if (d < bestDist) {
        best = bmp;
        bestDist = d;
      }
    }
    return best;
  }

  private window(): [number, number] {
    const before = this.direction > 0 ? BEHIND : AHEAD;
    const after = this.direction > 0 ? AHEAD : BEHIND;
    return [Math.max(0, this.center - before), Math.min(TOTAL_FRAMES - 1, this.center + after)];
  }

  private evict() {
    const [from, to] = this.window();
    for (const [i, bmp] of this.bitmaps) {
      if (i < from - EVICT_MARGIN || i > to + EVICT_MARGIN) {
        bmp.close();
        this.bitmaps.delete(i);
      }
    }
  }

  /** Lanza decodificaciones pendientes, de la más cercana al centro hacia afuera. */
  private pump() {
    if (this.decoding.size >= DECODE_CONCURRENCY) return;
    const [from, to] = this.window();
    const reach = Math.max(this.center - from, to - this.center);
    for (let d = 0; d <= reach && this.decoding.size < DECODE_CONCURRENCY; d++) {
      // Primero en la dirección del scroll, después hacia atrás.
      for (const i of [this.center + d * this.direction, this.center - d * this.direction]) {
        if (i < from || i > to || this.decoding.size >= DECODE_CONCURRENCY) continue;
        if (this.bitmaps.has(i) || this.decoding.has(i) || !this.blobs[i]) continue;
        this.decode(i);
      }
    }
  }

  private decode(i: number) {
    this.decoding.add(i);
    createImageBitmap(this.blobs[i]!, { resizeWidth: this.decodeWidth, resizeQuality: "high" })
      .then((bmp) => {
        const [from, to] = this.window();
        if (i >= from - EVICT_MARGIN && i <= to + EVICT_MARGIN) this.bitmaps.set(i, bmp);
        else bmp.close();
      })
      .catch(() => {})
      .finally(() => {
        this.decoding.delete(i);
        this.pump();
      });
  }
}

export const frameStore = new FrameStore();

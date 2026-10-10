/**
 * Fuente única de verdad para la estructura de la experiencia:
 * actos, clips, cantidad de fotogramas y pausas.
 * Ningún componente debe tener números de fotogramas hardcodeados.
 */

export const SEQUENCE_FPS = 12;

export type ClipId = "clip1" | "clip2" | "clip3" | "clip4" | "clip5" | "clip6";
export type PauseId = "hero" | "projects" | "stack" | "certs";
export type ObjectId = "dvd" | "pcb" | "certificate" | "floppy";
export type ActId = "boot" | "corridor" | "station" | "inversion" | "inside";
export type Variant = "desktop" | "mobile";

export interface ClipDef {
  id: ClipId;
  act: ActId;
  /** Cantidad de fotogramas exportados (≈ duración en s × SEQUENCE_FPS). */
  frameCount: number;
  /** Keyframes de referencia (docs/keyframes) entre los que interpola el clip. */
  from: string;
  to: string;
}

export interface PauseDef {
  id: PauseId;
  /** La pausa ocurre al terminar este clip. */
  afterClip: ClipId;
  /** Objetos 3D protagonistas de la pausa (vacío = R3F no renderiza). */
  objects: ObjectId[];
  /** Lado de la pantalla donde flotan los objetos (el panel HTML ocupa el opuesto). */
  objectsAt: "left" | "right" | "center";
  /** Duración de la pausa en el scroll, en "fotogramas equivalentes". */
  scrollLength: number;
}

export const CLIPS: ClipDef[] = [
  { id: "clip1", act: "corridor", frameCount: 96, from: "K1", to: "K2" },
  { id: "clip2", act: "station", frameCount: 96, from: "K2", to: "K3" },
  { id: "clip3", act: "station", frameCount: 96, from: "K3", to: "K4" },
  { id: "clip4", act: "station", frameCount: 96, from: "K4", to: "K5" },
  { id: "clip5", act: "inversion", frameCount: 96, from: "K5", to: "K6" },
  { id: "clip6", act: "inversion", frameCount: 96, from: "K6", to: "K7" },
];

export const PAUSES: PauseDef[] = [
  { id: "hero", afterClip: "clip1", objects: [], objectsAt: "center", scrollLength: 60 },
  { id: "projects", afterClip: "clip2", objects: ["dvd"], objectsAt: "left", scrollLength: 160 },
  { id: "stack", afterClip: "clip3", objects: ["pcb"], objectsAt: "right", scrollLength: 90 },
  { id: "certs", afterClip: "clip4", objects: ["certificate", "floppy"], objectsAt: "left", scrollLength: 120 },
];

/** Encendido del CRT entre el fin del clip 6 y el acto 4, en "fotogramas equivalentes". */
export const POWER_ON_LENGTH = 36;

/** Duración del tramo final (acto 4) en "fotogramas equivalentes". */
export const INSIDE_SCROLL_LENGTH = 60;

/** Píxeles de scroll por "fotograma equivalente". */
export const SCROLL_PX_PER_UNIT = 64;

export const SEQUENCE_WIDTH: Record<Variant, number> = { desktop: 1920, mobile: 960 };

export const TOTAL_FRAMES = CLIPS.reduce((acc, c) => acc + c.frameCount, 0);

export const TOTAL_SCROLL_UNITS =
  TOTAL_FRAMES + PAUSES.reduce((acc, p) => acc + p.scrollLength, 0) + POWER_ON_LENGTH + INSIDE_SCROLL_LENGTH;

export function framePath(clip: ClipId, localIndex: number, variant: Variant = "desktop") {
  const n = String(localIndex + 1).padStart(4, "0");
  const dir = variant === "mobile" ? `${clip}/mobile` : clip;
  return `/sequences/${dir}/${n}.webp`;
}

export function pauseAfter(clip: ClipId) {
  return PAUSES.find((p) => p.afterClip === clip);
}

export function pauseById(id: PauseId) {
  return PAUSES.find((p) => p.id === id)!;
}

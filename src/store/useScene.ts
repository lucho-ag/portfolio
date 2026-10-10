import { create } from "zustand";
import type { ActId, PauseId } from "@/sequence/manifest";

/**
 * Estado compartido de baja frecuencia. El índice de fotograma NO vive acá:
 * está en sequence/frameState.ts para no re-renderizar React en cada frame.
 */
interface SceneState {
  booted: boolean;
  /** 0–1: progreso de carga del clip 1 (lo muestra el Boot). */
  bootProgress: number;
  activeAct: ActId;
  activePause: PauseId | null;
  /** Proyecto seleccionado en el estante (índice en el orden de /content/projects). */
  selectedProject: number;
  /** Grupo de tecnologías resaltado en la PCB (índice en /content/stack.json). */
  activeStackGroup: number;
  /** Documento mostrado en el certificado 3D (certificaciones y luego logros). */
  selectedDocument: number;
  setBooted: (booted: boolean) => void;
  setBootProgress: (bootProgress: number) => void;
  setActiveAct: (activeAct: ActId) => void;
  setActivePause: (activePause: PauseId | null) => void;
  setSelectedProject: (selectedProject: number) => void;
  setActiveStackGroup: (activeStackGroup: number) => void;
  setSelectedDocument: (selectedDocument: number) => void;
}

export const useScene = create<SceneState>((set) => ({
  booted: false,
  bootProgress: 0,
  activeAct: "boot",
  activePause: null,
  selectedProject: 0,
  activeStackGroup: 0,
  selectedDocument: 0,
  setBooted: (booted) => set({ booted }),
  setBootProgress: (bootProgress) => set({ bootProgress }),
  setActiveAct: (activeAct) => set((s) => (s.activeAct === activeAct ? s : { activeAct })),
  setActivePause: (activePause) => set((s) => (s.activePause === activePause ? s : { activePause })),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setActiveStackGroup: (activeStackGroup) => set({ activeStackGroup }),
  setSelectedDocument: (selectedDocument) => set({ selectedDocument }),
}));

"use client";

import { Suspense, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PresentationControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { pauseById, type ObjectId, type PauseDef } from "@/sequence/manifest";
import { useScene } from "@/store/useScene";
import DVD from "./objects/DVD";
import PCB from "./objects/PCB";
import Certificate from "./objects/Certificate";
import Floppy from "./objects/Floppy";

/** Documento que se imprime en el certificado 3D (certificación o logro). */
export interface SceneDocument {
  kind: "CERTIFICATION" | "ACHIEVEMENT";
  title: string;
  subtitle: string;
  date: string;
}

/** Datos de /content que necesitan los objetos 3D (llegan desde el server por props). */
export interface SceneObjectProps {
  covers: string[];
  documents: SceneDocument[];
  holder: string;
}

const OBJECTS: Record<ObjectId, ComponentType<SceneObjectProps>> = {
  dvd: DVD,
  pcb: PCB,
  certificate: Certificate,
  floppy: Floppy,
};

/** Fracción del ancho visible que se desplazan los objetos hacia su lado. */
const SIDE_OFFSET = 0.22;
/** Separación entre objetos de una misma pausa; el segundo queda un poco más adelante. */
const OBJECT_SPACING = 1.5;
const OBJECT_DEPTH_STEP = 0.4;
/**
 * Composición a mano para pausas con varios objetos (gana sobre la separación automática):
 * el certificado atrás y el disquete adelante, pisándole la esquina, como sobre un escritorio.
 */
const OBJECT_LAYOUT: Partial<Record<ObjectId, [number, number, number]>> = {
  certificate: [-0.2, 0.18, -0.3],
  floppy: [0.85, -0.42, 0.45],
};

/** En vertical (mobile) el panel ocupa la parte de abajo: los objetos suben y se achican. */
const PORTRAIT_LIFT = 0.2;
const PORTRAIT_SCALE = 0.7;

/**
 * Ubica los objetos del lado opuesto al panel HTML, en proporción al viewport.
 * En vertical los centra arriba, porque el panel va abajo y a lo ancho.
 */
function Anchor({ side, children }: { side: PauseDef["objectsAt"]; children: ReactNode }) {
  const { width, height } = useThree((s) => s.viewport);
  if (width < height) {
    return (
      <group position-y={height * PORTRAIT_LIFT} scale={PORTRAIT_SCALE}>
        {children}
      </group>
    );
  }
  const x = side === "left" ? -width * SIDE_OFFSET : side === "right" ? width * SIDE_OFFSET : 0;
  return <group position-x={x}>{children}</group>;
}

const COARSE_POINTER = "(pointer: coarse)";
const subscribePointer = (onChange: () => void) => {
  const mql = window.matchMedia(COARSE_POINTER);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

/** En pantallas táctiles el arrastre 3D competiría con el scroll del dedo: se desactiva. */
function useCoarsePointer() {
  return useSyncExternalStore(subscribePointer, () => window.matchMedia(COARSE_POINTER).matches, () => false);
}

/** Capa 2: único Canvas R3F, transparente. Solo renderiza el objeto de la pausa activa. */
export default function Objects3D(sceneData: SceneObjectProps) {
  const activePause = useScene((s) => s.activePause);
  const pause = activePause ? pauseById(activePause) : null;
  const objects = pause?.objects ?? [];
  const active = objects.length > 0;
  const touch = useCoarsePointer();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 transition-[backdrop-filter] duration-500"
      style={{ backdropFilter: active ? "blur(6px) brightness(0.45)" : "none" }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        frameloop={active ? "always" : "demand"}
        camera={{ position: [0, 0, 5], fov: 35 }}
        className={active && !touch ? "pointer-events-auto" : ""}
      >
        {/* Key pálida (respeta los colores de las portadas), rim verde fósforo y ambiente teal. */}
        <ambientLight color="#0D1C17" intensity={1.5} />
        <directionalLight color="#B8FFC9" position={[3, 4, 5]} intensity={1.3} />
        <directionalLight color="#39FF7A" position={[-4, 1, -3]} intensity={2} />

        {/* Reflejos para metales: paneles de luz verde procedurales, sin HDR externo. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={1.2} color="#39FF7A" position={[0, 3, 2]} scale={[6, 1.5, 1]} />
          <Lightformer form="rect" intensity={1} color="#B8FFC9" position={[-4, 0, 3]} scale={[1, 4, 1]} />
          <Lightformer form="ring" intensity={2} color="#39FF7A" position={[3, -1, -3]} scale={2} />
        </Environment>

        {pause && (
          <Anchor side={pause.objectsAt}>
            <PresentationControls enabled={!touch} global snap polar={[-0.4, 0.4]} azimuth={[-Infinity, Infinity]}>
              <Suspense fallback={null}>
                {objects.map((id, i) => {
                  const Obj = OBJECTS[id];
                  return (
                    <group
                      key={id}
                      position={OBJECT_LAYOUT[id] ?? [(i - (objects.length - 1) / 2) * OBJECT_SPACING, 0, i * OBJECT_DEPTH_STEP]}
                    >
                      <Obj {...sceneData} />
                    </group>
                  );
                })}
              </Suspense>
            </PresentationControls>
          </Anchor>
        )}

        {active && (
          <EffectComposer>
            {/* Umbral alto: solo florecen los emisivos (toneMapped=false), no las superficies iluminadas. */}
            <Bloom intensity={0.6} luminanceThreshold={0.9} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}

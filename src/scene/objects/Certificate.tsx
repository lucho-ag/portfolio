"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type Group } from "three";
import { useScene } from "@/store/useScene";
import { CERT_HEIGHT, CERT_WIDTH, paintCertificate } from "../certificateTexture";
import type { SceneObjectProps } from "../Objects3D";
import { useSway } from "../useAutoRotate";

const WIDTH = 1.5;
const HEIGHT = WIDTH * (CERT_HEIGHT / CERT_WIDTH);
const FRAME = 0.06;
const DEPTH = 0.05;
/** Qué tan rápido termina de girar el certificado al cambiar de documento. */
const FLIP_DAMPING = 5;

function createTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = CERT_WIDTH;
  canvas.height = CERT_HEIGHT;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Certificado enmarcado, dibujado en código con los datos de /content. Muestra el documento
 * seleccionado en la pausa de certs; al cambiar, gira y aparece el nuevo.
 */
export default function Certificate({ documents, holder }: SceneObjectProps) {
  const selected = useScene((s) => s.selectedDocument);
  const doc = documents[selected % documents.length];
  const [texture] = useState(createTexture);
  const swayRef = useSway(0.35, 0.45);
  const flipRef = useRef<Group>(null);
  const flip = useRef(0);

  useEffect(() => {
    if (!doc) return;
    flip.current = Math.PI / 2; // empieza de canto: el cambio de textura queda oculto
    paintCertificate(texture, doc, holder);
  }, [doc, holder, texture]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    flip.current += (0 - flip.current) * (1 - Math.exp(-delta * FLIP_DAMPING));
    if (flipRef.current) flipRef.current.rotation.y = flip.current;
  });

  return (
    <group rotation={[-0.1, 0.25, -0.05]}>
      <group ref={swayRef}>
        <group ref={flipRef}>
          {/* Marco. */}
          <mesh position-z={-DEPTH / 2}>
            <boxGeometry args={[WIDTH + FRAME * 2, HEIGHT + FRAME * 2, DEPTH]} />
            <meshStandardMaterial color="#3E5C55" roughness={0.45} metalness={0.3} />
          </mesh>
          {/* Papel. */}
          <mesh position-z={0.001}>
            <planeGeometry args={[WIDTH, HEIGHT]} />
            <meshStandardMaterial map={texture} roughness={0.85} envMapIntensity={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

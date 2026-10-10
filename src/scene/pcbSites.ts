/**
 * Componentes de la PCB que se encienden en la pausa de stack. Cada grupo de /content/stack.json
 * se asigna, en orden, a un sitio (si hay más grupos que sitios, se repiten).
 *
 * Posiciones normalizadas sobre la cara superior del modelo pcb.glb, medidas sobre el modelo
 * original (cajas de los encapsulados de los IC y del conector):
 * u: 0 = borde izquierdo → 1 = derecho; v: 0 = borde superior → 1 = inferior; w/h: tamaño relativo;
 * t: altura de la cara superior del componente, 0 = fondo del modelo → 1 = punto más alto.
 * Son específicas de este modelo: si se cambia el .glb hay que recalibrarlas.
 */
export interface PcbSite {
  /** Designador de referencia, como en la serigrafía de una placa real. */
  designator: string;
  u: number;
  v: number;
  w: number;
  h: number;
  t: number;
}

export const PCB_SITES: PcbSite[] = [
  { designator: "U1", u: 0.579, v: 0.426, w: 0.197, h: 0.198, t: 0.701 },
  { designator: "U2", u: 0.33, v: 0.257, w: 0.07, h: 0.071, t: 0.66 },
  { designator: "U3", u: 0.442, v: 0.761, w: 0.146, h: 0.107, t: 0.692 },
  { designator: "J1", u: 0.607, v: 0.92, w: 0.225, h: 0.12, t: 0.917 },
];

export function siteFor(groupIndex: number) {
  return PCB_SITES[groupIndex % PCB_SITES.length];
}

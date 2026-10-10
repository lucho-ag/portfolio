import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";

/**
 * Carga un .glb (Meshopt) y lo devuelve centrado en el origen y escalado para que su
 * dimensión mayor mida `size` unidades, junto con sus dimensiones finales. Los modelos de Sketchfab vienen en escalas y
 * orígenes arbitrarios (mm, m, desplazados), así todos entran igual en escena.
 */
export function useFittedModel(url: string, size: number, options: { envMapIntensity?: number } = {}) {
  const { envMapIntensity } = options;
  const { scene } = useGLTF(url);
  return useMemo(() => {
    const model = scene.clone(true);
    // Intensidad de reflejos por modelo: se clonan los materiales para no tocar los del caché.
    if (envMapIntensity !== undefined) {
      model.traverse((child) => {
        if (!(child instanceof Mesh) || !(child.material instanceof MeshStandardMaterial)) return;
        child.material = child.material.clone();
        child.material.envMapIntensity = envMapIntensity;
      });
    }
    const box = new Box3().setFromObject(model);
    const dims = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    model.position.sub(center);

    const scale = size / Math.max(dims.x, dims.y, dims.z);
    const fitted = new Group();
    fitted.add(model);
    fitted.scale.setScalar(scale);
    /** Dimensiones finales en unidades de escena (para ubicar elementos sobre el modelo). */
    const fittedSize = dims.multiplyScalar(scale);
    return { object: fitted, size: fittedSize };
  }, [scene, size, envMapIntensity]);
}

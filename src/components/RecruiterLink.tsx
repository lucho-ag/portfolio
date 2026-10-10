import Link from "next/link";

/**
 * Atajo siempre visible al modo reclutador: quien no tiene tiempo para el recorrido
 * llega al CV completo en un clic. Por encima del Boot para que esté desde el primer segundo.
 */
export default function RecruiterLink() {
  return (
    <Link
      href="/cv"
      className="fixed right-4 top-4 z-[45] border border-phosphor-dim bg-void/80 px-2 py-0.5 font-display text-lg uppercase text-phosphor-dim backdrop-blur-sm hover:border-phosphor hover:text-phosphor-hot"
    >
      [CV] Modo reclutador
    </Link>
  );
}

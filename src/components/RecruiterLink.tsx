import Link from "next/link";
import CrtToggle from "./CrtToggle";

/**
 * Barra superior derecha: toggle del efecto CRT y atajo al modo reclutador (quien no tiene
 * tiempo para el recorrido llega al CV completo en un clic). Por encima del Boot para que esté
 * desde el primer segundo.
 */
export default function RecruiterLink() {
  return (
    <div className="fixed right-4 top-4 z-[45] flex gap-2">
      <CrtToggle />
      <Link
        href="/cv"
        aria-label="Modo reclutador: CV completo"
        className="border border-phosphor-dim bg-void/80 px-2 py-0.5 font-display text-lg uppercase text-phosphor-dim backdrop-blur-sm hover:border-phosphor hover:text-phosphor-hot"
      >
        [CV]<span className="max-md:hidden"> Modo reclutador</span>
      </Link>
    </div>
  );
}

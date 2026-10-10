import Link from "next/link";
import Window from "@/components/ui/Window";

/** 404 como error de terminal. */
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Window subject="ERROR 404" status="FILE NOT FOUND" className="w-full max-w-xl">
        <div className="space-y-2 font-mono text-sm">
          <p className="text-alert">bash: cd: no existe el archivo o el directorio</p>
          <p className="text-phosphor-dim">La ruta que buscás no está en este sistema.</p>
          <p className="pt-2 font-display text-xl uppercase">
            <Link href="/" className="text-phosphor hover:text-phosphor-hot">
              [↵] Volver al inicio
            </Link>
            <span className="text-phosphor-dim"> · </span>
            <Link href="/cv" className="text-phosphor hover:text-phosphor-hot">
              [CV] Modo reclutador
            </Link>
          </p>
          <p className="text-phosphor-hot">
            guest@portfolio:~$ <span className="crt-cursor">_</span>
          </p>
        </div>
      </Window>
    </main>
  );
}

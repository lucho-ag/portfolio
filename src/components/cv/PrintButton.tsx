"use client";

/** Abre el diálogo de impresión: desde ahí se guarda como PDF (con los estilos de impresión). */
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="text-phosphor hover:text-phosphor-hot">
      [↓] Descargar PDF
    </button>
  );
}

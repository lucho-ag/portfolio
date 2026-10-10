import type { ReactNode } from "react";

/**
 * Ventana tipo OS retro. Los bordes son spans independientes ([data-fx-edge]) para que
 * el revelado pueda "dibujarlos"; el contenido ([data-fx-surface]) aparece después.
 */
export default function Window({
  subject,
  status,
  children,
  className = "",
}: {
  subject: string;
  status?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section data-fx-window className={`relative flex flex-col ${className}`}>
      {/* Fondo y grilla: aparecen una vez dibujado el marco. */}
      <div data-fx-surface aria-hidden className="crt-grid absolute inset-0 bg-void/85 backdrop-blur-sm" />

      {/* Marco de 1px. */}
      <span data-fx-edge="x" aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-phosphor-dim" />
      <span data-fx-edge="y" aria-hidden className="absolute inset-y-0 right-0 w-px origin-top bg-phosphor-dim" />
      <span data-fx-edge="x" aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-right bg-phosphor-dim" />
      <span data-fx-edge="y" aria-hidden className="absolute inset-y-0 left-0 w-px origin-bottom bg-phosphor-dim" />

      {/* Marcas de esquina en fósforo pleno. */}
      <span aria-hidden className="crt-corner left-0 top-0 border-l border-t" />
      <span aria-hidden className="crt-corner right-0 top-0 border-r border-t" />
      <span aria-hidden className="crt-corner bottom-0 left-0 border-b border-l" />
      <span aria-hidden className="crt-corner bottom-0 right-0 border-b border-r" />

      <div className="relative flex max-h-full min-h-0 flex-1 flex-col">
        <header className="relative flex shrink-0 items-center justify-between gap-6 px-3 py-1 font-display text-lg uppercase">
          <span className="flex items-center gap-2 text-phosphor">
            <span data-fx="item" aria-hidden className="text-phosphor-hot">
              [■]
            </span>
            <span data-fx="scramble">SUBJECT: {subject}</span>
          </span>
          {status && (
            <span data-fx="scramble" className="text-phosphor-dim max-sm:hidden">
              STATUS: {status}
            </span>
          )}
          <span data-fx-edge="x" aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-phosphor-dim" />
        </header>
        {/* Si la ventana tiene alto acotado (mobile), el contenido scrollea adentro. */}
        <div className="crt-scroll flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </section>
  );
}

/**
 * Capa de la transición al acto 4 (la anima el timeline maestro, ver animation/timeline.ts):
 * la pantalla verde del video llena el cuadro, colapsa en una línea de fósforo y la línea se
 * abre en vertical encendiendo la interfaz, como un CRT al prenderse.
 */
export default function PowerOn() {
  return (
    <div data-poweron className="pointer-events-none invisible absolute inset-0 z-30" aria-hidden>
      <div data-poweron-void className="absolute inset-0 bg-void" />
      <div
        data-poweron-beam
        className="absolute inset-0 bg-phosphor"
        style={{ boxShadow: "0 0 40px 8px var(--phosphor), 0 0 120px 30px var(--phosphor-dim)" }}
      />
    </div>
  );
}

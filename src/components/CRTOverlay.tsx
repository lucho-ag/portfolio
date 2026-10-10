/** Capa 4: scanlines, grano, viñeta y flicker por encima de todo. Sin eventos de puntero. */
export default function CRTOverlay() {
  return (
    <div className="crt-overlay pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      <div className="crt-scanlines" />
      <div className="crt-grain" />
      <div className="crt-vignette" />
    </div>
  );
}

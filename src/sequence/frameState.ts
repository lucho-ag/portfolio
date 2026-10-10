/**
 * Índice de fotograma global. Lo escribe el timeline maestro (GSAP)
 * y lo lee SequenceCanvas dentro de requestAnimationFrame. Nunca pasa por React.
 */
export const frameState = { frame: 0 };

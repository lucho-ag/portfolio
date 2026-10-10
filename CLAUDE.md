# Portfolio — Retro Tech / CRT

Portfolio personal de un estudiante de Ingeniería en Sistemas. Experiencia de scrollytelling:
el visitante avanza por un pasillo de monitores CRT apagados, llega a una estación de trabajo geek,
recorre sus objetos (cada uno es una sección del portfolio) y termina "entrando" en la pantalla.

La historia se cuenta con **secuencias de fotogramas** controladas por el scroll (técnica tipo Apple).
Los **objetos 3D** aparecen en primer plano durante las pausas para dar interacción.
El contenido (proyectos, certificaciones, logros, contacto) es **HTML real**, legible e indexable.

## Stack

- Next.js (App Router) + TypeScript
- GSAP + ScrollTrigger (+ SplitText / ScrambleText) + Lenis para smooth scroll
- `<canvas>` 2D para las secuencias de fotogramas
- React Three Fiber + @react-three/drei + @react-three/postprocessing, solo para objetos protagonistas
- Zustand para estado compartido (progreso, acto activo, pausa activa)
- Tailwind CSS + CSS propio para efectos CRT
- Contenido en `/content` (MDX para proyectos, JSON para certificaciones y logros)
- Deploy en Vercel

## Arquitectura — capas (de atrás hacia adelante)

1. **SequenceCanvas** (`src/sequence/`): canvas 2D fijo a pantalla completa que dibuja el fotograma
   correspondiente al scroll. Dibuja con `drawImage` en modo "cover" y respeta el devicePixelRatio.
2. **Objects3D** (`src/scene/`): un único `<Canvas>` de R3F, fijo, con fondo transparente
   (`gl={{ alpha: true }}`). Solo muestra el objeto protagonista de la pausa activa.
3. **Sections** (`src/components/sections/`): paneles HTML que aparecen durante las pausas.
4. **CRTOverlay** (`src/components/CRTOverlay.tsx`): capa global de scanlines, grano, viñeta y flicker
   por encima de todo, con `pointer-events: none`. Unifica video y 3D y disimula artefactos de la IA.

### Reglas

- Un solo timeline maestro de GSAP (`src/animation/timeline.ts`) controla el índice de fotograma,
  las pausas (pin) y la entrada y salida de objetos 3D y paneles. No crear ScrollTriggers sueltos
  que compitan con él.
- La estructura de actos, clips, cantidad de fotogramas y pausas se define en
  `src/sequence/manifest.ts`. Ningún número mágico de fotogramas en componentes.
- El cambio de fotograma se hace en `requestAnimationFrame`, sin re-render de React.
  El índice vive en un ref, no en estado.
- Carga progresiva: el preloader (acto 0) carga el clip 1 completo. Los siguientes se cargan en
  segundo plano en orden. Si un fotograma no cargó todavía, se dibuja el más cercano disponible.
- Los objetos 3D no intentan coincidir con la perspectiva del video. Se presentan como objetos
  flotantes en primer plano, con el fondo oscurecido o desenfocado durante la pausa.
- En React usar siempre `useGSAP` con scope y cleanup. No usar `useState` dentro de `useFrame`.
- El contenido nunca se hardcodea en componentes: se lee de `/content`.

## Estructura de carpetas

```
content/            projects/*.mdx, certifications.json, achievements.json
public/
  sequences/        clip1/0001.webp ... (una carpeta por clip, + variante /mobile)
  models/           .glb comprimidos (dvd, pcb, certificate, floppy)
  textures/covers/  portadas de proyectos para el DVD 3D
  videos/           loops para la interfaz del acto 4
  images/           retrato ditherizado
src/
  app/
  animation/timeline.ts
  sequence/         manifest.ts, SequenceCanvas.tsx, loader.ts
  scene/            Objects3D.tsx, objects/ (DVD, PCB, Certificate, Floppy)
  components/       sections/, ui/, CRTOverlay.tsx, Boot.tsx
  store/useScene.ts
docs/keyframes/     keyframes de referencia (no se publican)
```

## Storyboard

| Acto | Fotogramas | Pausa / contenido | Objeto 3D |
|------|-----------|-------------------|-----------|
| 0. BOOT | — | Terminal tipo BIOS que tipea. Es el preloader real. | — |
| 1. PASILLO | clip1 (K1→K2) | Avance por el pasillo de CRTs apagados hacia la estación iluminada | — |
| 2a. LLEGADA | fin de clip1 | Pausa: nombre y título superpuestos (hero) | — |
| 2b. PROYECTOS | clip2 (K2→K3) | Pausa en el estante de discos: lista de proyectos | DVD girando con la portada del proyecto |
| 2c. STACK | clip3 (K3→K4) | Pausa en la PCB: tecnologías | PCB / chip |
| 2d. CERTS Y LOGROS | clip4 (K4→K5) | Pausa en el corcho: certificaciones y logros | Certificado / disquete |
| 3. INVERSIÓN | clip5 (K5→K6) + clip6 (K6→K7) | Frente al CRT principal, push-in y la pantalla se vuelve verde pleno | — |
| 4. DENTRO DEL CRT | — | Interfaz de fósforo en HTML/CSS: about, detalle de proyectos, contacto como terminal | — |

## Dirección visual

Referencias: UI monocromática de fósforo verde con imágenes ditherizadas, pasillo oscuro de CRTs
con un único foco de luz, pantalla verde saturada que tiñe la habitación, escritorio desordenado
de hardware beige de los 90 iluminado por luz verde ambiente.

### Paleta

| Token            | Hex       | Uso                                         |
|------------------|-----------|---------------------------------------------|
| `--void`         | `#040806` | fondo, negro verdoso (nunca #000 puro)      |
| `--ambient`      | `#0D1C17` | sombras, luz ambiente fría                  |
| `--teal-dim`     | `#3E5C55` | superficies apagadas                        |
| `--phosphor`     | `#39FF7A` | texto principal, emisivos                   |
| `--phosphor-dim` | `#1E7A45` | texto secundario, bordes, grillas           |
| `--phosphor-hot` | `#B8FFC9` | brillo máximo, cursor, hover                |
| `--beige`        | `#CFC6AE` | plástico de hardware 90s                     |
| `--alert`        | `#FF4433` | LEDs, acentos mínimos (con mucha moderación) |

### Tipografía

- Display / UI de terminal: fuente bitmap (VT323 o IBM VGA del "Ultimate Oldschool PC Font Pack").
- Cuerpo de texto largo: IBM Plex Mono o JetBrains Mono.
- Mayúsculas en títulos y labels; cuerpo en sentence case.

### Lenguaje de UI

- Ventanas tipo OS retro con barra de título (`SUBJECT:` / `STATUS:`) y borde de 1px en `--phosphor-dim`.
- Menús con atajos reales: `[P] Projects`, `[C] Certs`, `[A] About`, `[H] Help`.
- Grillas con ticks numerados, barras de progreso segmentadas.
- Texto que aparece tipeándose o con scramble, nunca con fade genérico.

### Objetos 3D

- Iluminación: luz principal verde fósforo, rim light verde y ambiente teal oscuro, coherente con el video.
- Bloom suave sobre partes emisivas. Rotación lenta automática y arrastrable con el mouse.

## Rendimiento (obligatorio)

- Secuencias en WebP, 12 fps de muestreo (~96 fotogramas por clip de 8 s), 1920 px desktop / 960 px mobile.
- Modelos `.glb` comprimidos con gltf-transform (Meshopt o Draco), menos de 2 MB cada uno.
- El canvas de R3F solo renderiza durante las pausas que tienen objeto (`frameloop="demand"` fuera de ellas).
- Objetivo: 60 fps en laptop media.

## Skills a usar

- GSAP oficial (greensock/gsap-skills): core, timeline, scrolltrigger, plugins, react, performance
- frontend-design
- react-three-fiber / threejs-webgl
- retro-crt-style (skill propia, a crear con skill-creator)

## Fases

1. Experiencia principal desktop (prioridad actual)
2. Modo reclutador + versión mobile + reduced motion

# Portfolio — Luciano Agostino

Portfolio interactivo con estética **retro tech / CRT**. En lugar de una página con secciones, es un
recorrido guiado por el scroll: el visitante avanza por un pasillo de monitores apagados, llega a una
estación de trabajo de los 90, recorre sus objetos (cada uno es una sección del portfolio) y termina
"entrando" en la pantalla, donde lo espera una terminal.

> Estudiante de Ingeniería en Informática (UADE). Desarrollo de software y gestión de datos.

---

## La experiencia

| # | Capítulo | Qué pasa |
|---|----------|----------|
| 0 | **Boot** | Pantalla de BIOS que tipea mientras carga el primer clip. Es el preloader real. |
| 1 | **Corridor** | Avance por un pasillo de CRTs apagados hacia una estación iluminada. |
| 2 | **Arrival** | Pausa con nombre y título en una ventana de consola. |
| 3 | **Projects** | Estante de discos: lista navegable y un **DVD 3D** que muestra la portada del proyecto elegido. |
| 4 | **Stack** | Una **PCB 3D**: cada grupo de tecnologías enciende un chip de la placa. |
| 5 | **Certs** | Certificaciones y logros: un **certificado 3D** dibujado en código con los datos de cada documento, junto a un disquete. |
| 6 | **Terminal** | La pantalla se enciende como un CRT y adentro hay una interfaz de fósforo con atajos de teclado y una terminal con comandos (`help`, `projects`, `open 1`, `contact`, …). |

### Formas de recorrerla

- **Scroll** (rueda, trackpad o táctil): controla el video fotograma a fotograma.
- **HUD de capítulos**: barra inferior en escritorio y píldora superior en celulares. Al capítulo vecino
  recorre la transición real del video; los saltos largos usan un "cambio de canal" con estática.
- **Teclado**: `← →` / `RePág AvPág` entre capítulos, `Inicio` / `Fin`, `↑↓` dentro de cada pausa y
  atajos `[T] [P] [C] [A] [M] [H]` en la interfaz final.
- **Modo reclutador** (`/cv`): todo el contenido en una página rápida e imprimible como PDF.
- **Reducir movimiento**: si el sistema lo pide, se muestra la versión estática (con opción de ver la animada).

---

## Stack técnico

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **GSAP** (ScrollTrigger, ScrambleText, SplitText, TextPlugin) + **Lenis** para el scroll suave
- **Canvas 2D** para las secuencias de fotogramas
- **React Three Fiber** + **drei** + **postprocessing** para los objetos 3D
- **Zustand** para el estado compartido
- **Tailwind CSS v4** + CSS propio para los efectos CRT
- Contenido en **MDX** y **JSON**
- Deploy en **Vercel**

### Cómo funciona por dentro

```
Capas (de atrás hacia adelante)
├── SequenceCanvas   canvas 2D fijo que dibuja el fotograma según el scroll
├── Objects3D        un único canvas de R3F, transparente, con el objeto de la pausa activa
├── Sections         paneles HTML reales (legibles e indexables)
└── CRTOverlay       scanlines, grano y viñeta por encima de todo
```

- **Un solo timeline maestro** (`src/animation/timeline.ts`) controla el fotograma, las pausas y la
  entrada y salida de paneles. La estructura (clips, fotogramas, pausas y capítulos) se define en
  `src/sequence/manifest.ts`.
- **Fotogramas**: WebP a 12 fps (1920 px en escritorio, 960 px en celulares). Se descargan comprimidos y
  solo se decodifica una ventana alrededor del fotograma actual, fuera del hilo principal. El canvas
  funde cada fotograma con el siguiente según la posición exacta del scroll para que se vea continuo.
- **Revelado de texto**: los textos se decodifican, se tipean o se barren línea por línea
  (`src/animation/reveal.ts`), pero el HTML completo siempre está en la página para buscadores y
  lectores de pantalla.
- **Modelos 3D**: comprimidos con gltf-transform (Meshopt). El DVD y el certificado se generan en código.

---

## Desarrollo

Requisitos: **Node.js 20.9 o superior**.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run lint
```

### Editar el contenido

Todo el contenido vive en `content/` y ningún componente lo tiene escrito a mano:

| Archivo | Qué contiene |
|---------|--------------|
| `content/site.json` | Nombre, título, presentación, experiencia, líneas del boot y contacto |
| `content/projects/*.mdx` | Un archivo por proyecto: `export const meta = { … }` + descripción |
| `content/stack.json` | Grupos de tecnologías (cada grupo enciende un chip de la PCB) |
| `content/certifications.json` | Certificaciones |
| `content/achievements.json` | Logros y actividades |
| `content/credits.json` | Atribuciones obligatorias de recursos de terceros |

Las portadas de los proyectos (para el DVD) van en `public/textures/covers/`.

### Regenerar los fotogramas

Los videos fuente **no están en el repositorio** (pesan demasiado). Para regenerar las secuencias hay
que tener los clips en `media/clips/clip1.mp4 … clip6.mp4` y correr:

```bash
npm run frames            # todos los clips
npm run frames -- clip3   # solo uno
```

El script usa `ffmpeg-static` (no hace falta instalar ffmpeg) y verifica que la cantidad de
fotogramas coincida con `manifest.ts`.

---

## Deploy

El proyecto es 100 % estático y se despliega en Vercel sin configuración extra.

- `NEXT_PUBLIC_SITE_URL` (opcional): URL pública para Open Graph, sitemap y robots. Si no está definida
  se usa el dominio de producción de Vercel.
- Los fotogramas, modelos y portadas se sirven con una semana de caché (`next.config.ts`).

---

## Créditos

- **"Diskette"** de [MaximP](https://sketchfab.com/MaximP) —
  [Sketchfab](https://sketchfab.com/3d-models/diskette-d55408adf9294edc973fa771de84f8af), CC-BY-4.0.
- **"Drone Control PCB v3"** de [Plasmabot1](https://sketchfab.com/Plasmabot1) —
  [Sketchfab](https://sketchfab.com/3d-models/drone-control-pcb-v3-839dfadc63cf42a3a50e7bfb04f3979e), CC-BY-4.0.
- Fuente pixel de la imagen de preview: **Kenney Pixel** de [Kenney](https://www.kenney.nl/assets/kenney-fonts), CC0.
- Tipografías del sitio: VT323 e IBM Plex Mono (Google Fonts).

---

## Contacto

- Email: [lucho.agostino@gmail.com](mailto:lucho.agostino@gmail.com)
- LinkedIn: [linkedin.com/in/luciano-agostino](https://www.linkedin.com/in/luciano-agostino)
- GitHub: [github.com/lucho-ag](https://github.com/lucho-ag)

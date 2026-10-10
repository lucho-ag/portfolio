---
name: retro-crt-style
description: Visual language of this portfolio — green-phosphor CRT, retro OS windows, bitmap type, scanlines, 90s beige hardware. Use this skill whenever you create or restyle any UI in this repo (sections, panels, menus, the Boot terminal, the act-4 "inside the CRT" interface, hover states, loaders, progress bars), animate text, tweak CRTOverlay, light or material a 3D object in src/scene, or pick any color, font or effect — even if the request only says "make it look nicer", "add a panel" or "style this".
---

# Retro CRT style

The site is a scrollytelling trip down a dark corridor of dead CRTs into a 90s workstation lit by
green phosphor, ending *inside* the screen. Every UI element should feel like it is being
displayed **on** that monitor: monochrome, emissive, a bit unstable. When in doubt, ask
"would a 1994 terminal render this?" — if not, it probably breaks the illusion.

## Palette (tokens live in `src/app/globals.css`)

Use the Tailwind classes generated from the tokens (`text-phosphor`, `border-phosphor-dim`,
`bg-void`…) or `var(--token)`. Never introduce a raw hex in a component: the palette is small on
purpose, and one stray color makes the whole thing read as "web page" instead of "monitor".

| Token | Hex | Use |
|---|---|---|
| `void` | `#040806` | Backgrounds. Greenish black — pure `#000` looks dead next to the video frames. |
| `ambient` | `#0D1C17` | Shadows, panel fills, ambient light |
| `teal-dim` | `#3E5C55` | Off/inactive surfaces |
| `phosphor` | `#39FF7A` | Main text, emissives |
| `phosphor-dim` | `#1E7A45` | Secondary text, 1px borders, grids, ticks |
| `phosphor-hot` | `#B8FFC9` | Peak brightness: cursor, hover, active item |
| `beige` | `#CFC6AE` | 90s hardware plastic (3D objects, rarely UI) |
| `alert` | `#FF4433` | LEDs, a single critical accent. If you've used it twice on a screen, remove one. |

Brightness is hierarchy: hot > phosphor > dim. Don't use opacity tricks on text to fake levels —
use the three phosphor tokens. Glow (`drop-shadow` / `text-shadow` in `--phosphor`) is for the
hero and for emissive peaks only; glow on body text kills legibility.

## Typography

- `font-display` (VT323, bitmap): titles, labels, menus, window title bars, terminal lines. UPPERCASE.
- `font-mono` (IBM Plex Mono): long-form body copy (project descriptions, about). Sentence case.
- No sans-serif anywhere, no italics, no font weights beyond 400/500. Bitmap fonts look best at
  sizes that are multiples of their grid — prefer `text-xl`, `text-2xl`, `text-3xl`, `text-7xl`.

## UI language

**Windows** — every content panel is a retro OS window: use `src/components/ui/Window.tsx`
(title bar with `SUBJECT:` left and `STATUS:` right, 1px `phosphor-dim` border, no radius, no
shadow). STATUS should say something diegetic and true-ish: `3 DISCS`, `ONLINE`,
`AWAITING INPUT`, `12 FILES` — derived from content, not decorative lorem.

**Menus** — real keyboard shortcuts in brackets: `[P] Projects  [C] Certs  [A] About  [H] Help`.
If you show a shortcut, wire it up; a fake shortcut is worse than none.

**Data display** — numbered lists `[1] … [2] …`, grids with numbered ticks, segmented progress
bars built from characters (`█` filled / `░` empty, see `Boot.tsx`), `> LABEL:` prompts.

**Shapes** — square corners, 1px lines, hard edges. No `rounded-*`, no gradients on UI, no
soft box-shadows, no glassmorphism beyond the slight `backdrop-blur-sm` that lets the video
breathe behind a window.

**Interaction** — hover = shift to `phosphor-hot` (optionally invert: `bg-phosphor text-void`).
Transitions are stepped, not eased: `ease: "steps(n)"` in GSAP, or instant.

## Text motion

Text appears by being **typed** or **scrambled**, never by a generic opacity fade or slide-up —
those are the clearest tell of a template site.

- Typing: GSAP `TextPlugin` (`text: "…"`, `ease: "none"`, ~0.02 s per char). See `Boot.tsx`.
- Scramble/decode: GSAP `ScrambleTextPlugin` with `chars: "upperCase"` or `"01"` for headings
  entering a pause.
- Large blocks: `SplitText` by lines and reveal line by line with `steps`.
- Blinking cursor: `_` in `phosphor-hot`.
- Panels themselves may fade (`autoAlpha`) inside the master timeline; the *text inside them*
  should still type/scramble.

All of this follows the project rule: animations triggered by scroll belong to the master
timeline (`src/animation/timeline.ts`); use `useGSAP` with scope for local, non-scroll motion.
Respect `prefers-reduced-motion`: show final text immediately.

## CRT overlay

`src/components/CRTOverlay.tsx` + `.crt-*` classes in `globals.css` sit on top of everything
(`z-50`, `pointer-events: none`): scanlines with a subtle stepped flicker, SVG noise grain,
and a vignette. It unifies the AI-generated video, the 3D layer and the HTML, and hides seams.

- Keep it cheap: CSS only, no canvas, no per-frame JS.
- Keep it subtle: grain ≤ 0.08 opacity, scanline darkness ≤ 0.4. If text gets hard to read,
  the overlay is too strong — fix the overlay, not the text.
- Don't duplicate scanlines inside individual components; the global layer already does it.
- Optional extras that fit: slight barrel distortion on the act-4 interface, chromatic
  aberration on transitions, a brief horizontal roll when switching acts.

## 3D objects (src/scene)

Light them like the video, so they feel lit by the same monitor:

- Key light: directional, `--phosphor` color, front-top.
- Rim light: `--phosphor`, from behind/side, to separate from the dark background.
- Ambient: `--ambient` teal, low.
- Materials: beige plastic (`--beige`, rough), PCB green (`--phosphor-dim`), metallic
  disc/shutter surfaces; emissive parts in `--phosphor` so Bloom picks them up.
- Bloom soft (`intensity ~0.6`, `luminanceThreshold ~0.6`): only emissives should bloom.
- Slow auto-rotation (`useAutoRotate`) + draggable (`PresentationControls`). No environment
  maps with colored skies; no white lights.
- Objects float in the foreground; they don't try to match the video's perspective. During
  their pause the background is dimmed/blurred.

## Imagery

Photos (portrait, project covers in the act-4 UI) are **dithered and monochrome green**:
1-bit or ordered (Bayer) dithering mapped to `void` → `phosphor`. DVD covers for the 3D disc may
keep color — they're physical objects in the room.

## Quick checklist before finishing a UI change

1. Only palette tokens? No raw hex, no grays, no pure black/white.
2. Display text uppercase in VT323, body in Plex Mono?
3. Panels use `Window`, square corners, 1px `phosphor-dim`?
4. Text types/scrambles in rather than fading?
5. Still readable under the CRT overlay?
6. Content comes from `/content`, not hardcoded strings?

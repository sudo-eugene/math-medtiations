# Product Requirements Specification (PRS)

## 1. Vision

A minimalist, contemplative website presenting **365 daily meditations**. Each entry pairs **one full‑screen, mathematically generated nature animation** with **one quote**. The experience feels calm, timeless, and distraction‑free, encouraging slow scrolling through the year.

## 2. Objectives & Success Metrics

* **Inspiration**: Users spend >2 minutes per session; scroll at least 5 entries on average.
* **Performance**: First paint <1.5s on 4G mid‑tier phone; animation steady at **≥ 50–60fps** on modern laptops.
* **Accessibility**: WCAG 2.2 AA (reduced motion, contrast, keyboard nav, screen reader labels).
* **Sustainability**: Initial JS ≤ **200–300KB** gzip; scene code **lazy‑loaded** per entry.

## 3. Audience

* Mindfulness/meditation enthusiasts, design & maths‑curious audiences, educators.

## 4. Core Experience

* **Layout**: Full‑screen viewport per entry. Animation canvas left/centre; quote (number, text, author) arranged to mirror the reference image; responsive shift to stacked layout on mobile.
* **Navigation**: Vertical scroll advances entries (snap optional). Sticky minimal header with **Today** / **Random** / **Index**. Keyboard ↑/↓, PageUp/PageDown; swipe on touch.
* **Daily mode**: Deep link `/day/033` (or `/2025-02-02`) and a **Today** route.
* **Share**: Copy link; image/social card generation per entry.
* **Ambient audio (optional)**: Subtle generative sound; respects reduced‑motion/audio‑prefers‑reduced.

## 5. Content Model (CMS)

Each **Entry** has:

* `id` (int 1–365)
* `date` (optional mapping)
* `title` (short cue)
* `quoteText`, `quoteAuthor`, `source` (with copyright/PD flags)
* `animationKey` (e.g., `phyllotaxis.sunflower`)
* `params` (JSON for the scene: colours, speed, density)
* `palette` (bg, fg, accent)
* `caption` (maths inspiration blurb, ≤ 280 chars)
* `tags` (e.g., *spiral*, *golden‑ratio*)
* `seo` (slug, description, open‑graph image ref)
* `licenses` (quote licence/provenance)

> Example

```json
{
  "id": 33,
  "title": "Stillness & Strength",
  "quoteText": "To know others brings intelligence...",
  "quoteAuthor": "Lao Tzu",
  "source": "Tao Te Ching (tr. public domain)",
  "animationKey": "phyllotaxis.sunflower",
  "params": { "seedCount": 20000, "speed": 0.08, "background": "#F7F5EE" },
  "palette": { "bg": "#F7F5EE", "fg": "#1E1E1C", "accent": "#C7C1B8" },
  "caption": "Vogel spiral using the golden angle π(3−√5).",
  "tags": ["spiral", "phyllotaxis", "golden"],
  "seo": { "slug": "33-stillness-and-strength", "description": "Phyllotaxis animation with daily meditation" },
  "licenses": { "quote": "PD" }
}
```

## 6. Animation System

* **Tech**: Three.js + GLSL shaders. Each scene is a module implementing a unified interface.
* **Interface**

```ts
export type SceneParams = Record<string, any>
export interface NatureScene {
  mount(el: HTMLDivElement, params: SceneParams): void
  update(t: number): void // requestAnimationFrame hook
  resize(): void
  dispose(): void
  metadata: { key: string; title: string; family: string }
}
```

* **Loader**: Dynamic import by `animationKey`, e.g. `import('scenes/phyllotaxis/sunflower')`.
* **Reduced Motion**: Honour `prefers-reduced-motion` → pause/replace with static SVG/PNG.
* **Performance budgets**: per‑scene bundle ≤ 80–120KB gzip; vertices/points tuned for 60fps on M1 Air; fallback quality tier for mobile.

### Initial Scene Library (30 families → enough to cover 365 with variants)

* **Phyllotaxis** (sunflower, spherical, cylindrical, Lucas variants)
* **Logarithmic shells** (Nautilus‑style)
* **Mandelbrot/Julia orbit traps** (2D) and **Mandelbulb** (ray‑marched light version)
* **Strange attractors** (Lorenz, Rössler, Clifford, Aizawa)
* **Reaction–diffusion** (Gray–Scott plane & sphere)
* **Flow fields** (curl noise galaxies, aurora ribbons)
* **N‑body galaxy** (2D GPU particles with soft‑gravity)
* **Voronoi/Poisson** (venation & crackle)
* **Quasicrystal interference**
* **Wave/Water (Gerstner)**
* **Isosurfaces** (gyroid/metaballs lightweight SDF)
* **Diffusion‑limited aggregation** (lite)
* **Epicycles (hypo/epi‑trochoids)**
* **Lenia/SmoothLife** (GPU CA, gentle)
  *(…plus variants for colour/motion/density to reach 365 unique items.)*

## 7. Information Architecture

* `/` — Today (or Day 1 if offline/no clock)
* `/day/[001…365]` — canonical daily entry
* `/random` — jumps to any day
* `/index` — grid index of 365 tiles (static thumbs)
* `/about` — project, methodology, licences

## 8. UX & Visual System

* **Type**: single elegant serif for quotes; monospaced small caps for numbers; accessible line‑heights.
* **Grid**: 12‑col desktop; 4‑col mobile. Quote column width 40–50ch.
* **Theme**: neutral paper‑like background by default; palette per entry.
* **Controls**: unobtrusive progress ticks (1–365) along the side.

## 9. Functional Requirements

* Scroll to progress; route updates on entry change
* Persist last read day (localStorage)
* Toggle **Play/Pause**, **Sound** (if enabled), **Reduced Motion**
* Preload next entry’s quote & low‑res animation thumb
* Offline cache last 10 entries (PWA lite)

## 10. Non‑Functional Requirements

* **SEO**: Static metadata per entry; OG image render (server function/headless Chrome or node‑canvas).
* **Internationalisation**: British English default; future‑proof for locales.
* **Security**: No user‑generated content; strict CSP; third‑party free (no heavy trackers).
* **Privacy**: No cookies beyond essential settings; privacy page.

## 11. Accessibility

* Focus order & skip links; keyboard nav for next/previous
* `aria-live` for quote changes; semantic quotations with `<blockquote>` & `<cite>`
* **Reduced motion**: stop/heavily tame animations; provide static frame
* Min contrast 4.5:1; font size ≥ 16px; avoid rapid flashes

## 12. Legal & Licensing

* Prefer **public‑domain** or licensed quotes; maintain source & licence per entry.
* Maths animations are original works (copyright the project). Include permissive site licence terms.

## 13. Tech Stack

* **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind
* **Graphics**: Three.js + GLSL shaders (per‑scene modules)
* **CMS**: Sanity/Contentful or flat **MDX/JSON** (starter can be MDX; upgrade to headless CMS when scaling)
* **Deployment**: Vercel/Netlify; image optimisation via platform
* **Analytics**: Privacy‑friendly (Plausible/Umami) with page‑view only

## 14. Delivery Plan & Milestones

1. **Week 1–2 — Foundations**

   * Repo, CI, ESLint/Prettier, Playwright + Vitest
   * Shell pages, routing, layout, theme
   * Animation host & interface; port *Phyllotaxis Sunflower* (from canvas)
2. **Week 3–4 — Content & Library**

   * CMS schema; seed with 30 entries
   * Implement 10 scene families (≥ 30 variants)
3. **Week 5–6 — Scale & Polish**

   * Index grid, share cards, performance passes, reduced motion
   * Accessibility audit
4. **Week 7 — Content Fill**

   * Expand to 120 entries; editorial review
5. **Week 8–10 — Complete**

   * Reach 365 entries; final QA; launch

## 15. Acceptance Criteria (sample for an entry)

* Route `/day/033` loads within 1.5s on 4G (TTI ≤ 3s); CLS < 0.02
* Canvas renders at ≥ 50fps on M1 Air; CPU ≤ 40% on Chrome idle
* Quote readable (≥ 4.5:1 contrast); keyboard can reach controls
* `prefers-reduced-motion` shows static frame in ≤ 400ms
* Social share of `/day/033` has unique OG image and title

## 16. Risks & Mitigations

* **Quote licensing** → Use PD lists, or budget for permissions.
* **Performance on low‑end mobile** → Multi‑quality scenes; cap particle counts.
* **Creation workload** → Procedural parameterisation + theming *per family* to scale.

## 17. Open Questions

* Should the order follow the calendar (seasonal themes) or a curated narrative?
* Audio ambience in scope for v1?
* Which CMS do we prefer (MDX minimal vs hosted headless)?

## 18. Engineering Notes

* File structure

```
apps/web
  /app/(routes)
  /components
  /scenes
    /phyllotaxis/sunflower.ts
    /attractors/lorenz.ts
  /lib/animations.ts // registry & loader
  /styles
packages/ui // shared typography and layout primitives
```

* Animation registry example

```ts
export const registry = {
  'phyllotaxis.sunflower': () => import('@/scenes/phyllotaxis/sunflower'),
  'attractor.lorenz': () => import('@/scenes/attractors/lorenz'),
  // ...
}
```

---

This PRS is ready to review. Next, I can scaffold the repo (Next.js + TypeScript), create the **Entry** schema, and wire the **AnimationHost** to load the sunflower scene as the first exemplar.

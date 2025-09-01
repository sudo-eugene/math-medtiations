export type SceneParams = Record<string, any>;

export interface NatureScene {
  mount(el: HTMLDivElement, params: SceneParams): void;
  update(t: number): void; // seconds since mount
  resize(): void;
  dispose(): void;
  metadata: { key: string; title: string; family: string };
}

type Loader = () => Promise<any>;

export const registry: Record<string, Loader> = {
  "phyllotaxis.sunflower": () => import("@/scenes/phyllotaxis/sunflower"),
  "fibonacci.golden_spiral": () => import("@/scenes/fibonacci/golden_spiral"),
  "fractal.mandelbrot": () => import("@/scenes/fractal/mandelbrot"),
  "galaxy.spiral": () => import("@/scenes/galaxy/spiral"),
  "advanced.torus_field": () => import("@/scenes/advanced/torus_field"),
  "advanced.mandelbrot_zoom": () => import("@/scenes/advanced/mandelbrot_zoom"),
  "advanced.lorenz_attractor": () => import("@/scenes/advanced/lorenz_attractor"),
  "advanced.reaction_diffusion": () => import("@/scenes/advanced/reaction_diffusion"),
  "advanced.quantum_dots": () => import("@/scenes/advanced/quantum_dots"),
  "advanced.strange_attractor": () => import("@/scenes/advanced/strange_attractor"),
  "advanced.particle_life": () => import("@/scenes/advanced/particle_life"),
};

export function getLoaderByKey(key: string): Loader {
  const loader = registry[key];
  if (!loader) throw new Error(`Scene not found: ${key}`);
  return loader;
}


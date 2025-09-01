import React from "react";

export type ArtParams = Record<string, any>;
export type ArtComponent = React.ComponentType<{ params?: ArtParams }>;

// Dynamic loaders for code-splitting
export function getArtLoaderByKey(key: string): (() => Promise<{ default: ArtComponent }>) {
  switch (key) {
    case "static.fibonacci_spiral":
      return () => import("./scenes/FibonacciSpiral");
    case "static.phyllotaxis_sunflower":
      return () => import("./scenes/PhyllotaxisSunflower");
    case "static.flower_of_life":
      return () => import("./scenes/FlowerOfLife");
    case "static.atom_orbits":
      return () => import("./scenes/AtomOrbits");
    case "static.galaxy_spiral":
      return () => import("./scenes/GalaxySpiral");
    default:
      return () => import("./scenes/PhyllotaxisSunflower");
  }
}

export const STATIC_ART_KEYS = [
  "static.fibonacci_spiral",
  "static.phyllotaxis_sunflower",
  "static.flower_of_life",
  "static.atom_orbits",
  "static.galaxy_spiral",
] as const;

export type StaticArtKey = typeof STATIC_ART_KEYS[number];

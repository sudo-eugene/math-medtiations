"use client";
import React, { useEffect, useRef } from "react";
import { getLoaderByKey, NatureScene, SceneParams } from "@/lib/animations";

type Props = {
  animationKey: string;
  params?: SceneParams;
  className?: string;
};

export default function AnimationHost({ animationKey, params, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<NatureScene | null>(null);
  const rafRef = useRef<number | null>(null);
  const animateRef = useRef<boolean>(true);
  const versionRef = useRef(0);

  useEffect(() => {
    let disposed = false;
    const el = containerRef.current!;
    let start = performance.now();
    const myVersion = ++versionRef.current;
    let localScene: NatureScene | null = null;
    let localRaf: number | null = null;

    const setup = async () => {
      try {
        const loader = getLoaderByKey(animationKey);
        const mod = await loader();
        // If a newer setup started, abort this one
        if (versionRef.current !== myVersion || disposed) return;

        // Clear any existing children (dev Strict Mode may mount effects twice)
        while (el.firstChild) el.removeChild(el.firstChild);

        const scene: NatureScene = (mod && (mod.default || mod.scene)) || mod;
        if (!scene || typeof scene.mount !== "function") throw new Error("Invalid scene module");
        localScene = scene;
        sceneRef.current = scene; // optional: keep latest for debugging
        localScene.mount(el, params || {});

        const onResize = () => localScene?.resize();
        window.addEventListener("resize", onResize);

        // Reduced motion handling
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
        animateRef.current = !mql.matches;

        const loop = (t: number) => {
          if (disposed) return;
          if (animateRef.current) {
            localScene?.update((t - start) / 1000);
            localRaf = requestAnimationFrame(loop);
            rafRef.current = localRaf; // optional
          } else {
            // Render a static frame when reduced motion is preferred
            localScene?.update(0);
          }
        };

        const handleMotionChange = () => {
          animateRef.current = !mql.matches;
          if (animateRef.current) {
            start = performance.now();
            if (localRaf) cancelAnimationFrame(localRaf);
            localRaf = requestAnimationFrame(loop);
            rafRef.current = localRaf; // optional
          } else {
            if (localRaf) cancelAnimationFrame(localRaf);
            localRaf = null;
            localScene?.update(0);
          }
        };
        mql.addEventListener?.("change", handleMotionChange);

        // Start loop based on preference
        if (animateRef.current) {
          localRaf = requestAnimationFrame(loop);
          rafRef.current = localRaf; // optional
        } else {
          localScene?.update(0);
        }

        return () => {
          window.removeEventListener("resize", onResize);
          mql.removeEventListener?.("change", handleMotionChange);
        };
      } catch (err) {
        console.error(err);
      }
    };

    setup();

    return () => {
      disposed = true;
      if (localRaf) cancelAnimationFrame(localRaf);
      localRaf = null;
      localScene?.dispose();
      localScene = null;
      // Ensure container is cleared on unmount
      const elNow = containerRef.current;
      if (elNow) {
        while (elNow.firstChild) elNow.removeChild(elNow.firstChild);
      }
    };
  }, [animationKey, params]);

  return <div ref={containerRef} className={className ?? "w-full h-full overflow-hidden"} />;
}

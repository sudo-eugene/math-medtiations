"use client";
import React, { useEffect, useState } from "react";
import { getArtLoaderByKey, type ArtComponent, type ArtParams } from "@/lib/static-art";

type Props = {
  artKey: string;
  params?: ArtParams;
  className?: string;
};

export default function StaticArtHost({ artKey, params, className }: Props) {
  const [Comp, setComp] = useState<ArtComponent | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const loader = getArtLoaderByKey(artKey);
        const mod = await loader();
        if (!alive) return;
        setComp(() => mod.default);
      } catch (e) {
        console.error(e);
        setComp(() => null);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [artKey]);

  return (
    <div className={className ?? "w-full h-full"}>
      {Comp ? (
        <Comp params={params} />
      ) : (
        <div className="w-full h-full bg-white/50" />
      )}
    </div>
  );
}

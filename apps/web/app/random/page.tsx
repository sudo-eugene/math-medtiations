"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RandomPage() {
  const router = useRouter();
  useEffect(() => {
    const n = Math.floor(Math.random() * 365) + 1;
    const slug = n.toString().padStart(3, "0");
    router.replace(`/day/${slug}`);
  }, [router]);
  return <div className="p-6">Jumping to a random day…</div>;
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
// import { videoPathFromName } from "@/components/ColorCard";
import type { Color } from "@/types";

type VideoMap = Record<string, boolean>;

/**
 * Returns a map of { jsonId: boolean } indicating whether a video exists
 * at /public/videos/<encodeURIComponent(color.name)>.mp4
 */
export function useVideoAvailability(
  colors: Pick<Color, "jsonId" | "name">[]
) {
  const cacheRef = useRef<Map<string, boolean>>(new Map());
  const [videoMap, setVideoMap] = useState<VideoMap>({});
  const [loading, setLoading] = useState(true);

  // Stable key so the effect only runs when the set of (id,name) pairs changes
  const depKey = useMemo(
    () => colors.map((c) => `${c.jsonId}::${c.name}`).join("|"),
    [colors]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);

      const entries = await Promise.all(
        colors.map(async (c) => {
          const path = (c.name);
          if (cacheRef.current.has(path)) {
            return [c.jsonId, !!cacheRef.current.get(path)] as const;
          }
          try {
            const res = await fetch(path, { method: "HEAD" });
            const ok = res.ok;
            cacheRef.current.set(path, ok);
            return [c.jsonId, ok] as const;
          } catch {
            cacheRef.current.set(path, false);
            return [c.jsonId, false] as const;
          }
        })
      );

      if (!cancelled) {
        setVideoMap(Object.fromEntries(entries));
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [depKey]);

  return { videoMap, loading };
}

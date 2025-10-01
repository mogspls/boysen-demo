"use client";
import { useRef, useState, useEffect } from "react";
import colors from "@/lib/data.json";
import gsap from "gsap";

interface Color {
  jsonId: string;
  code: string;
  name: string;
  variant: string;
  imageurl: string;
  red: string; // if you can change your JSON, make these numbers
  green: string;
  blue: string;
}

const videoPathFromName = (name: string) =>
  `/videos/${encodeURIComponent(name)}.mp4`;

export default function Home() {
  const colorsData: Color[] = colors as Color[];

  // NEW: separate "active" (keeps scale up) vs "playing" (mask expanded / 9:16)
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // cache HEAD checks so we don’t re-request
  const videoCache = useRef<Map<string, boolean>>(new Map());

  // per-card refs
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const tileRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // HEAD check by color.name
  const headCheck = async (name: string) => {
    const path = videoPathFromName(name);
    if (videoCache.current.has(path)) return videoCache.current.get(path);
    try {
      const res = await fetch(path, { method: "HEAD" });
      const ok = res.ok;
      videoCache.current.set(path, ok);
      return ok;
    } catch {
      videoCache.current.set(path, false);
      return false;
    }
  };

  // Collapse mask, hide video, show text again (keeps card scaled if active)
  const hideAndReset = async (id: string) => {
    const videoEl = videoRefs.current[id];
    if (!videoEl) return;

    // collapse the circular mask to reveal the color swatch underneath
    await gsap.to(videoEl, {
      duration: 0.45,
      ease: "power3.inOut",
      "--r": "0%" as any,
    });

    videoEl.pause();
    videoEl.currentTime = 0;
    videoEl.onended = null;
    gsap.set(videoEl, { visibility: "hidden" as any });

    // switch media area back to square by clearing "playing"
    setPlayingId((p) => (p === id ? null : p));
  };

  // Run the “reveal” animation + play video for a color
  const revealAndPlay = async (c: Color) => {
    const id = c.jsonId;
    const videoEl = videoRefs.current[id];
    if (!videoEl) return;

    const exists = await headCheck(c.name);
    // Always set active (scale up), even if no video.
    setActiveId(id);

    if (!exists) return; // nothing else if no video file

    // prepare video
    videoEl.src = videoPathFromName(c.name);
    videoEl.currentTime = 0;
    videoEl.muted = false; // user click should allow with sound
    videoEl.playsInline = true;

    // show the video with mask collapsed and mark as "playing" (9:16 area)
    gsap.set(videoEl, { visibility: "visible" as any, "--r": "0%" as any });
    setPlayingId(id);

    // Expand mask (reveal video)
    await gsap.to(videoEl, {
      duration: 0.55,
      ease: "power3.inOut",
      "--r": "140%" as any, // circle(var(--r) at 50% 50%)
    });

    try {
      await videoEl.play();
    } catch {
      // autoplay blocked or issue: gracefully reset
      await hideAndReset(id);
      return;
    }

    // On finish: collapse mask → square aspect → show name/code; keep scale via activeId
    videoEl.onended = () => {
      hideAndReset(id);
    };
  };

  // Click handler that also resets any previously active/playing card first
  const handleSelect = async (color: Color) => {
    if (activeId && activeId !== color.jsonId) {
      await hideAndReset(activeId); // ensure previous is reset if switching selections
    }
    await revealAndPlay(color);
  };

  useEffect(() => {
    const onPointerDown = async (e: PointerEvent) => {
      if (!activeId) return;
      if (!(e.target instanceof Element)) return;

      const activeEl = tileRefs.current[activeId];

      // If clicking inside the active card, ignore
      if (activeEl && activeEl.contains(e.target)) return;

      // If clicking another card, let that card's onClick handle switching
      const clickedCard = e.target.closest("[data-card-id]");
      if (clickedCard) return;

      // Otherwise: truly outside → close
      const id = activeId; // snapshot
      if (playingId === id) {
        await hideAndReset(id);
      }
      setPlayingId((p) => (p === id ? null : p));
      setActiveId(null);
    };

    // Use pointerdown so it fires before onClick on some elements
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      } as any);
  }, [activeId, playingId, hideAndReset, tileRefs]);

  return (
    <main className="flex flex-col gap-4">
      <div className="max-w-screen-2xl mx-auto w-full px-2">
        <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(125px,_1fr))]">
          {colorsData.map((color) => {
            const isActive = activeId === color.jsonId;
            const isPlaying = playingId === color.jsonId;

            return (
              <div
                key={color.jsonId}
                ref={(el) => {
                  tileRefs.current[color.jsonId] = el;
                }}
                className={[
                  "bg-white rounded-sm w-full flex flex-col justify-between relative",
                  "transition-all duration-300 ease-out transform",
                  isActive && isPlaying
                    ? "scale-200 shadow-2xl z-10 aspect-[9/16]"
                    : isActive && !isPlaying
                    ? "scale-200 shadow-xl aspect-[9/16] p-2 z-10"
                    : "shadow-xl hover:shadow-2xl p-2"
                ].join(" ")}
              >
                <div className="w-full flex justify-end">
                  <img
                    src="/Logo.png"
                    alt="Boysen"
                    aria-hidden={!(isActive && !isPlaying)}
                    className={[
                      "w-12 transition-opacity duration-300",
                      isActive && !isPlaying
                        ? "opacity-100"
                        : "opacity-0 absolute",
                    ].join(" ")}
                  />
                </div>
                <div className="w-full">
                  {/* MEDIA AREA */}
                  <div
                    className={[
                      "relative rounded-sm overflow-hidden transition-all",
                      isPlaying ? "aspect-[9/16]" : "aspect-square",
                    ].join(" ")}
                  >
                    {/* COLOR SWATCH layer (always present beneath the video) */}
                    <div
                      role="button"
                      tabIndex={0}
                      className="absolute inset-0 rounded-sm cursor-pointer outline-none"
                      style={{
                        backgroundColor: `rgb(${color.red}, ${color.green}, ${color.blue})`,
                      }}
                      onClick={() => handleSelect(color)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleSelect(color);
                      }}
                    />

                    {/* VIDEO masked by animating CSS var --r */}
                    <video
                      ref={(el) => {
                        videoRefs.current[color.jsonId] = el;
                      }}
                      className="absolute inset-0 h-full w-full object-cover rounded-sm"
                      style={{
                        visibility: "hidden",
                        clipPath: "circle(var(--r, 0%) at 50% 50%)",
                        WebkitClipPath: "circle(var(--r, 0%) at 50% 50%)",
                        ["--r" as any]: "0%",
                      }}
                      onClick={() => {
                        if (isPlaying && isActive){ hideAndReset(color.jsonId)}
                      }}
                    />
                  </div>
                </div>
                {/* META (hide while playing; visible when ended; stays while scaled) */}
                <div
                  className={`py-2 transition-opacity bottom-0 ${
                    isPlaying ? "hidden opacity-0 absolute" : "opacity-100"
                  }`}
                >
                  <p className="font-bold leading-4">{color.name}</p>
                  <p className="text-sm text-black/70">{color.code}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

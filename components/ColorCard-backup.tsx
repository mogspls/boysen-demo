"use client";
import { Color } from "@/types";
import { useState } from "react";

export const videoPathFromName = (name: string) =>
  `/videos/${encodeURIComponent(name)}.mp4`;

type Props = Color & {
  hasVideo?: boolean;
  loading?: boolean;
};

export default function ColorCard({
  red,
  green,
  blue,
  name,
  jsonId,
  code,
  hasVideo,
  loading,
}: Props) {

  // This is for the 
  const [active, setActive] = useState<boolean>(false);

  // Simple contrast helper (returns "#000" or "#fff")
  function getTextColor(rStr: string, gStr: string, bStr: string) {
    const r = Math.max(0, Math.min(255, parseInt(rStr, 10) || 0));
    const g = Math.max(0, Math.min(255, parseInt(gStr, 10) || 0));
    const b = Math.max(0, Math.min(255, parseInt(bStr, 10) || 0));
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 186 ? "#000" : "#fff";
  }

  return (
    <article className="hover:scale-150 bg-white p-2 transition-transform hover:z-10 cursor-pointer rounded-sm hover:shadow-2xl relative">
      {/* Change view if has video */}
      {hasVideo ? (
        <div className="aspect-square object-center object-contain relative">
          <video
            className={`object-cover object-center h-full aspect-square bg-[${red}, ${green}, ${blue}]`}
            style={{}}
            autoPlay={false}
          >
            <source src={videoPathFromName(name)} type="video/mp4" />
          </video>
          <div className="border-solid border-2 border-white rounded-full absolute top-1/2 left-1/2 transform -translate-1/2 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              // stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
          </div>
        </div>
      ) : (
        <div
          className="w-full aspect-square rounded-sm"
          style={{ backgroundColor: `rgba(${red}, ${green}, ${blue})` }}
          aria-label={hasVideo ? "Has video" : "No video"}
        />
      )}
      <div className="flex flex-col gap-1 py-2">
        <p className="font-bold leading-4">{name}</p>
        <p className="text-sm text-black/70">{code}</p>
        {/* Optional tiny hint */}
        {!loading && (
          <span className="text-xs opacity-60">
            {hasVideo ? "🎬 Video" : "➕ Share your story"}
          </span>
        )}
      </div>
    </article>
  );
}

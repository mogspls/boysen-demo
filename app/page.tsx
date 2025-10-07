"use client";
import ColorCard from "@/components/ColorCard-backup";
import { Color } from "@/types";
import colors from "@/lib/data.json";

export default function Home() {
  const colorsData: Color[] = colors as Color[];

  return (
    <main className="flex flex-col gap-4">
      <div className="max-w-screen-2xl mx-auto w-full px-2 md:px-6">
        <div
          className="grid gap-1 grid-cols-2
          sm:gap-2 sm:grid-cols-3
          lg:grid-cols-[repeat(auto-fit,minmax(175px,_1fr))] mt-24
          "
          data-pop-boundary
        >
          {colorsData.map((color, index) => (
            <ColorCard
              key={index}
              {...color}
              // Optional: wire callbacks for later (GSAP/video/story)
              onPlayRequested={(c) => {
                // TODO: your GSAP reveal; set video.src when needed
                console.log("play video for", c.name);
              }}
              onStoryRequested={(c) => {
                // TODO: open your story form modal/drawer
                console.log("open story view for", c.name);
              }}
              imageurl={color.imageurl}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

"use client";
import { Color } from "@/types";
import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const videoPathFromName = (name: string) =>
  `/videos/${encodeURIComponent(name)}.mp4`;

type Props = Color & {
  hasVideo?: boolean;
  loading?: boolean;
  onPlayRequested?: (c: Color) => void;
  onStoryRequested?: (c: Color) => void;
  onUploadRequested?: (c: Color) => void;
  imageurl?: string;
};

// Contrast helpers
export function getTextColor(rStr: string, gStr: string, bStr: string) {
  const r = Math.max(0, Math.min(255, parseInt(rStr, 10) || 0));
  const g = Math.max(0, Math.min(255, parseInt(gStr, 10) || 0));
  const b = Math.max(0, Math.min(255, parseInt(bStr, 10) || 0));
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 186 ? "#000" : "#fff";
}
export function getContrastBG(rStr: string, gStr: string, bStr: string) {
  const r = Math.max(0, Math.min(255, parseInt(rStr, 10) || 0));
  const g = Math.max(0, Math.min(255, parseInt(gStr, 10) || 0));
  const b = Math.max(0, Math.min(255, parseInt(bStr, 10) || 0));
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 186 ? "#fff" : "#000";
}

export default function ColorCard({
  red,
  green,
  blue,
  name,
  jsonId,
  code,
  hasVideo = false,
  loading = false,
  onPlayRequested,
  onStoryRequested,
  onUploadRequested,
  imageurl,
  ...rest
}: Props) {
  // modal + modes
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"video" | "story">("story");

  // flip state for showing the "behind" of the Dialog
  const [flipped, setFlipped] = useState(false);
  const [backMode, setBackMode] = useState<"upload" | "write" | null>(null);

  // video state
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const textColor = getTextColor(red, green, blue);
  const contrastBG = getContrastBG(red, green, blue);

  // Clicking the card opens dialog (video first if available)
  const handleCardClick = () => {
    setFlipped(false);
    setBackMode(null);
    if (hasVideo) {
      setModalMode("video");
      setOpen(true);
      onPlayRequested?.(baseColorPayload());
    } else {
      setModalMode("story");
      setOpen(true);
      onStoryRequested?.(baseColorPayload());
    }
  };

  // Pause video when modal closes
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [open]);

  const baseColorPayload = (): Color =>
    ({
      red,
      green,
      blue,
      name,
      jsonId,
      code,
      hasVideo: !!hasVideo,
      variant: "",
      imageurl: "",
    } as Color);

  // From front view → flip to back with selected mode
  const handleStoryAction = (kind: "write" | "upload") => {
    // pause video if currently playing before flipping
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }
    if (kind === "write") {
      onStoryRequested?.(baseColorPayload());
      setBackMode("write");
    } else {
      onUploadRequested?.(baseColorPayload());
      setBackMode("upload");
    }
    // Flip to the back face
    setFlipped(true);
  };

  // Flip back to the front (no close)
  const handleFlipBack = () => {
    setFlipped(false);
    // Optional: reset backMode if you want
    // setBackMode(null);
  };

  return (
    <>
      <article
        data-card-id={jsonId}
        className="hover:scale-150 bg-white p-2 hover:p-4 transition-all hover:z-10 cursor-pointer rounded-lg relative hover:[&>aside]:opacity-100 hover:shadow-[0px_0px_42px_15px_rgba(0,0,0,0.2)] color-card"
        {...rest}
      >
        {/* MEDIA AREA (visual only; click opens modal) */}
        <div
          className="relative w-full rounded-xl overflow-hidden transition-all aspect-square"
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleCardClick();
          }}
          style={{
            background: `rgba(${red}, ${green}, ${blue}, 100%)`,
          }}
        >
          {/* Poster or base color */}
          {hasVideo && imageurl ? (
            <div
              className="absolute inset-0 rounded-xl bg-center bg-cover"
              style={{
                background: imageurl
                  ? `url("/thumbs/${name}.png") center/cover no-repeat`
                  : `rgb(${red}, ${green}, ${blue})`,
              }}
            />
          ) : hasVideo && !imageurl ? (
            <div
              style={{
                background: `rgba(${red}, ${green}, ${blue}, 50%)`,
              }}
            >
              <video
                className="absolute inset-0 h-full w-full object-cover rounded-sm pointer-events-none"
                playsInline
                muted
                controls={false}
                preload="metadata"
                disablePictureInPicture
                aria-hidden="true"
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  try {
                    v.currentTime = 0.001;
                  } catch {}
                  v.pause();
                }}
              >
                <source src={videoPathFromName(name)} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div
              className="absolute inset-0 rounded-xl bg-center bg-cover"
              style={{
                background: imageurl
                  ? `url("/thumbs/${name}.png") center/cover no-repeat`
                  : `rgb(${red}, ${green}, ${blue})`,
              }}
            />
          )}

          {/* Play affordance */}
          {hasVideo && (
            <aside
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 playbtn"
              aria-hidden
            >
              <div
                className="rounded-full p-3 backdrop-blur-sm shadow-2xl"
                style={{ boxShadow: "0px 0px 42px 15px rgba(0,0,0,0.2)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-12 h-12"
                  fill="white"
                >
                  <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              </div>
            </aside>
          )}
        </div>

        {/* META */}
        <div className="flex flex-col py-2">
          <p
            className="font-bold leading-5 text-lg"
            style={{ fontFamily: "futura-pt-bold, sans-serif" }}
          >
            {name}
          </p>
          <p
            className="text-xs text-black"
            style={{ fontFamily: "futura-pt, sans-serif" }}
          >
            {code}
          </p>
        </div>
      </article>

      {/* MODAL / FLIP-CARD DIALOG */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setFlipped(false);
        }}
      >
        <DialogContent
          className={`max-w-[75vw] sm:max-w-lg md:max-w-md p-0 overflow-hidden`}
          style={{ backgroundColor: `rgb(${red}, ${green}, ${blue})` }}
          showCloseButton={false}
        >
          <div
            className={`
              ${modalMode === "video" ? "aspect-[9/16]" : "min-h-[315px]"}
            `}
          >
            <div className={`absolute inset-0 flex flex-col`}>
              <VisuallyHidden asChild>
                <DialogHeader>
                  <DialogTitle>{name}</DialogTitle>
                  <DialogDescription className="sr-only">
                    Video or color story for {name}
                  </DialogDescription>
                </DialogHeader>
              </VisuallyHidden>

              {modalMode === "video" ? (
                <>
                  <div
                    className="text-white fixed right-0 top-0 text-4xl z-10 transform translate-x-12 cursor-pointer"
                    role="button"
                    onClick={() => setOpen(false)}
                  >
                    &times;
                  </div>
                  <div className="relative w-full overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-auto aspect-[9/16]"
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      autoPlay
                      onClick={(e) => {
                        const v = e.currentTarget;
                        if (v.paused) v.play();
                        else v.pause();
                      }}
                    >
                      <source src={videoPathFromName(name)} type="video/mp4" />
                    </video>
                  </div>
                </>
              ) : (
                <div className={`px-6 py-4 pt-12 `}>
                  <div
                    className="fixed right-5 top-2 text-4xl z-10 transform cursor-pointer"
                    role="button"
                    onClick={() => setOpen(false)}
                    style={{ color: textColor }}
                  >
                    &times;
                  </div>
                  <DialogHeader>
                    <DialogTitle
                      className="text-center text-2xl"
                      style={{ color: textColor }}
                    >
                      Oops! There's no color story for {name} yet!
                    </DialogTitle>
                    <DialogDescription
                      className="text-center"
                      style={{ color: textColor }}
                    >
                      Send it in — if we publish your story, you could win
                      Boysen gift cards.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="p-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        id="writestory"
                        variant="outline"
                        className={`duration-75 rounded-full bg-transparent cursor-pointer border-1 border-[${textColor}] [&>svg]:fill-[${textColor}] text-[${textColor}] hover:bg-[${textColor}] hover:text-[${contrastBG}] hover:[&>svg]:fill-[${contrastBG}]`}
                        onClick={() => handleStoryAction("write")}
                      >
                        <svg
                          width="21"
                          height="26"
                          viewBox="0 0 21 26"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M2.59645 0.381644C2.97708 0.161891 3.3434 0.337434 3.70118 0.495411L16.8377 6.26939C17.5779 6.61129 18.0531 7.36476 17.9959 8.18635L17.5225 15.0023C18.3238 14.8352 19.175 15.1885 19.6061 15.9353L20.7188 17.8625C21.2563 18.7935 20.9372 19.9847 20.0061 20.5223L11.3338 25.5292C10.4028 26.0668 9.21155 25.7476 8.67399 24.8165L7.56134 22.8894C7.12324 22.1305 7.25364 21.1992 7.82091 20.5907L1.83837 17.4749C1.13083 17.1061 0.743281 16.3486 0.799628 15.5645L2.14697 1.40889C2.18438 1.01471 2.20979 0.604885 2.59645 0.381644ZM9.10889 21.675C8.9764 21.7515 8.93058 21.9225 9.00708 22.055L10.1197 23.9821C10.1962 24.1146 10.3672 24.1604 10.4997 24.0839L19.1719 19.077C19.3044 19.0005 19.3502 18.8295 19.2737 18.6971L18.1611 16.7699C18.0846 16.6374 17.9136 16.5916 17.7811 16.6681L9.10889 21.675ZM7.99945 8.07077C8.07689 8.10475 8.14678 8.14791 8.21634 8.19608C9.19898 8.93281 10.3899 9.34048 11.6193 9.36143L12.4521 9.37686C13.2198 9.44108 13.6927 10.2601 13.3632 10.9578L12.9614 11.686C12.3624 12.7626 12.1348 13.9957 12.2679 15.2165C12.3414 16.0975 11.35 16.7309 10.607 16.1754C9.61801 15.4471 8.43298 15.0441 7.20403 15.0101L6.44874 14.9981C5.60857 14.9837 5.08702 14.0804 5.49464 13.3455L5.86191 12.6854C6.44899 11.6077 6.7016 10.3763 6.55417 9.15574C6.54724 9.07141 6.5448 8.9893 6.55409 8.90525L3.59729 3.78394L2.46137 15.7215C2.45946 15.835 2.50564 15.9401 2.60991 15.9955L9.44531 19.5538L15.788 15.8919L16.3318 8.0715C16.3398 7.9545 16.2734 7.84508 16.1659 7.79795L5.01071 2.89372L7.99945 8.07077ZM8.25796 10.1875C8.20799 11.286 7.91765 12.3658 7.40139 13.3464C8.50875 13.3896 9.58909 13.678 10.566 14.1852C10.6153 13.0856 10.9056 12.0058 11.4219 11.0251C10.3145 10.9819 9.2342 10.6935 8.25796 10.1875Z" />
                        </svg>
                        Write a story
                      </Button>

                      <Button
                        id="uploadvideo"
                        variant="outline"
                        className={`duration-75 rounded-full bg-transparent cursor-pointer border-1 border-[${textColor}] [&>svg]:fill-[${textColor}] text-[${textColor}] hover:bg-[${textColor}] hover:text-[${contrastBG}] hover:[&>svg]:fill-[${contrastBG}]`}
                        onClick={() => handleStoryAction("upload")}
                      >
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M24.9678 16.0002C25.539 16.0003 25.9999 16.4529 26 17.0139V21.2756C25.9999 23.8813 23.8423 26.0002 21.1885 26.0002H8.81152C6.15786 26.0002 4.00012 23.8815 4 21.2756V17.0139C4.00006 16.4529 4.461 16.0003 5.03223 16.0002C5.60359 16.0002 6.06439 16.4528 6.06445 17.0139V21.2756C6.06458 22.7633 7.29778 23.9728 8.81152 23.9728H21.1885C22.7035 23.9727 23.9344 22.7619 23.9346 21.2756V17.0139C23.9346 16.4528 24.3964 16.0002 24.9678 16.0002ZM14.251 4.31854C14.6649 3.89376 15.3376 3.89388 15.7529 4.31854L20.6885 9.36932C21.1039 9.79305 21.1039 10.4823 20.6885 10.9074C20.4822 11.1213 20.2092 11.2258 19.9365 11.2258C19.6638 11.2258 19.3936 11.1213 19.1846 10.9074L16.0645 7.71405V17.9113C16.0645 18.5134 15.5902 18.9999 15.002 19.0002C14.4135 19.0002 13.9377 18.5136 13.9336 17.9113V7.71405L10.8145 10.9074C10.4005 11.3325 9.72695 11.3324 9.31152 10.9074C8.89611 10.4837 8.89611 9.79447 9.31152 9.36932L14.251 4.31854Z" />
                        </svg>
                        Upload Video
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BACK FACE (rotated 180deg on Z so it shows when container is flipped) */}
            <div
              className={`absolute inset-0 ${
                flipped ? "" : "[backface-visibility:hidden]"
              } ![transform:rotateY(180deg)] flex flex-col`}
            >
              {/* Back header */}
              <div className="flex items-center justify-between px-4 py-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: contrastBG }}
                >
                  {backMode === "upload"
                    ? "Upload your video"
                    : "Write your story"}
                </h3>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleFlipBack}>
                    Back
                  </Button>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>

              {/* Back content */}
              <div className="flex-1 overflow-auto px-6 pb-6">
                {backMode === "upload" ? (
                  <div className="space-y-4">
                    {/* Placeholder upload UI; wire up to your uploader */}
                    <div className="rounded-xl border border-white/40 p-6 bg-white/10">
                      <p className="mb-3" style={{ color: contrastBG }}>
                        Drop an MP4 (portrait 9:16) or click to select.
                      </p>
                      <label className="block">
                        <input
                          type="file"
                          accept="video/mp4"
                          className="hidden"
                        />
                        <div className="rounded-md border border-dashed border-white/60 p-8 text-center cursor-pointer">
                          <span style={{ color: contrastBG }}>
                            Click to choose a file
                          </span>
                        </div>
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <Button className="rounded-full">Submit</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Simple story form; replace with your editor if needed */}
                    <div className="space-y-2">
                      <label
                        className="block text-sm"
                        style={{ color: contrastBG }}
                      >
                        Title
                      </label>
                      <input
                        className="w-full rounded-md px-3 py-2 bg-white/90 text-black outline-none"
                        placeholder={`Color story for ${name}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="block text-sm"
                        style={{ color: contrastBG }}
                      >
                        Story
                      </label>
                      <textarea
                        className="w-full rounded-md px-3 py-2 min-h-[160px] bg-white/90 text-black outline-none"
                        placeholder="Tell us why this color matters to you..."
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button className="rounded-full">Publish Story</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

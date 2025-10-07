"use client";
import { Color } from "@/types";
import { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { on } from "events";
import { get } from "http";

const SCALE = 1.5;

export const videoPathFromName = (name: string) =>
  `/videos/${encodeURIComponent(name)}.mp4`;

type Props = Color & {
  hasVideo?: boolean;
  loading?: boolean;
  onPlayRequested?: () => void;
  onStoryRequested?: () => void;
  onUploadRequested?: () => void;
  imageurl?: string;
  key?: number | string;
};

// Simple contrast helper (returns "#000" or "#fff")
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

function computeShift(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  // optional boundary: add data-pop-boundary to your grid wrapper
  const boundaryEl = el.closest("[data-pop-boundary]") as HTMLElement | null;
  const b = boundaryEl?.getBoundingClientRect() ?? {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const scaledW = rect.width * SCALE;
  const scaledH = rect.height * SCALE;

  const scaledLeft = rect.left - (scaledW - rect.width) / 2;
  const scaledTop = rect.top - (scaledH - rect.height) / 2;
  const scaledRight = scaledLeft + scaledW;
  const scaledBottom = scaledTop + scaledH;

  const overflowLeft = Math.max(0, b.left - scaledLeft);
  const overflowRight = Math.max(0, scaledRight - b.right);
  const overflowTop = Math.max(0, b.top - scaledTop);
  const overflowBottom = Math.max(0, scaledBottom - b.bottom);

  // positive x pushes right, positive y pushes down
  return {
    x: overflowLeft - overflowRight,
    y: overflowTop - overflowBottom,
  };
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

  // Card Ref
  const cardRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shift, setShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Modal
  const [open, setOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"video" | "story">("story");
  const [view, setView] = useState<"write" | "upload" | null>(null);

  // Card centering on Desktop
  const handleEnter = () => {
    const el = cardRef.current;
    if (!el) return;
    setShift(computeShift(el));
  };
  const handleLeave = () => setShift({ x: 0, y: 0 });

  const handleCardClick = () => {
    if (hasVideo) {
      setModalMode("video");
      setOpen(true);
    } else {
      setModalMode("story");
      setOpen(true);
    }
  };

  const handleStoryAction = (kind: "write" | "upload" | null) => {
    // pause video if currently playing before flipping
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }
    if (kind === "write") {
      setView("write");
      console.log("Write story for", `"${name}"`);
    } else {
      setView("upload");
      console.log("Upload story for", `"${name}"`);
    }
  };

  // Pause video when modal closes
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
    }
  }, [open]);

  const textColor = getTextColor(red, green, blue);
  const contrastBG = getContrastBG(red, green, blue);

  return (
    <>
      {/* Card */}
      <article
        data-card-id={jsonId}
        {...rest}
        ref={cardRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        // if you also want to handle keyboard focus grow:
        onFocus={handleEnter}
        onBlur={handleLeave}
        className="
          color-card relative cursor-pointer rounded-lg
          transition-all duration-150
          hover:z-20 isolation-auto
          hover:shadow-[0_0_42px_15px_rgba(0,0,0,0.2)] 
          bg-white p-2 hover:p-4 hover:[&>aside]:opacity-100
          transform-gpu hover:scale-150
          hover:translate-x-[calc(var(--pop-x,0px)/1.5)]
          hover:translate-y-[calc(var(--pop-y,0px)/1.5)]
        "
        style={
          {
            // CSS vars for Tailwind arbitrary values below
            "--pop-x": `${shift.x}px`,
            "--pop-y": `${shift.y}px`,
            // you can keep your bg as before
          } as React.CSSProperties
        }
      >
        {/* MEDIA */}
        {!hasVideo && !imageurl ? (
          <div
            className="inset-0 rounded-xl bg-center bg-cover aspect-square"
            style={{
              background: imageurl
                ? `url("/thumbs/${name}.png") center/cover no-repeat`
                : `rgb(${red}, ${green}, ${blue})`,
            }}
            onClick={handleCardClick}
          />
        ) : // If the video has a thumbnail image
        hasVideo && !imageurl ? (
          // If the video has no thumbnail image
          <div
            className="aspect-square object-center object-contain relative"
            onClick={handleCardClick}
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
            <div className="border-solid border-2 border-white rounded-full absolute top-1/2 left-1/2 transform -translate-1/2 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
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
          <>
            {/* If the color has both video and imageurl */}
            <div
              className="relative inset-0 rounded-xl bg-center bg-cover aspect-square"
              style={{
                background: imageurl
                  ? `url("/thumbs/${name}.png") center/cover no-repeat`
                  : `rgb(${red}, ${green}, ${blue})`,
              }}
              onClick={handleCardClick}
            >
              {/* Play affordance */}
              {hasVideo && (
                <aside
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 playbtn"
                  aria-hidden
                >
                  <div
                    className="rounded-full p-3 shadow-2xl"
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
          </>
        )}
        {/* META */}
        <section className="flex flex-col py-2">
          <p
            className="font-bold leading-5 text-[1.3em]"
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
        </section>
      </article>

      {/* Modal */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
        }}
      >
        <DialogContent
          className="border-none w-full p-4 bg-transparent outline-0"
          showCloseButton={false}
        >
          {/* For a11y's sake, kindly ignore */}
          {modalMode === "video" ? (
            <div className="Video">
              <VisuallyHidden asChild>
                <DialogHeader>
                  <DialogTitle>{name}</DialogTitle>
                  <DialogDescription className="sr-only">
                    Video or color story for {name}
                  </DialogDescription>
                </DialogHeader>
              </VisuallyHidden>
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
                  className="w-full h-auto aspect-[9/16] object-bottom"
                  playsInline
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
            </div>
          ) : (
            <div
              className="h-full pt-12 pb-6 px-12 rounded-2xl outline-0"
              style={{ background: `rgb(${red}, ${green}, ${blue})` }}
            >
              <VisuallyHidden asChild>
                <DialogHeader>
                  <DialogTitle>{name}</DialogTitle>
                  <DialogDescription className="sr-only">
                    Video or color story for {name}
                  </DialogDescription>
                </DialogHeader>
              </VisuallyHidden>
              <div
                className="fixed right-8 top-5 text-4xl z-10 transform cursor-pointer"
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
                  Oops! There's no color story for <br />
                  {name} yet!
                </DialogTitle>
                <DialogDescription
                  className="text-center"
                  style={{ color: textColor }}
                >
                  How about you send it in, and if we publish your story, you'll
                  get a chance to win Boysen gift cards.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
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
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client"
import { useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Header() {

	gsap.registerPlugin(ScrollTrigger);

	return (
    <header>
      <div className="max-w-screen-2xl mx-auto w-full px-2 md:px-8 py-6">
        <div
          className="font-semibold inline-flex gap-2 text-4xl items-center"
          style={{ fontFamily: "Helvetica, sans-serif" }}
        >
          <div>
            <img
              src="/boysenlogo.png"
              alt="BOYSEN®️"
              style={{
                width: "100%",
                maxWidth: "36rem"
              }}
            />
          </div>
        </div>
        <div className="leading-5 text-[1em] sm:text-[0.9em] md:text-base" style={{ fontFamily: "Helvetica, sans-serif"}}>
          <p>Boysen has over 4,000 colors.<br className="block sm:hidden"/> Each with its own quirky name.</p>
          <p>Click on a color to uncover the story behind it.</p>
          <p> See a color without a story? <br className="block sm:hidden"/> That’s your chance to create one!</p>
        </div>
      </div>
    </header>
  );
}
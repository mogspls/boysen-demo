"use client"
import { useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Header() {

	gsap.registerPlugin(ScrollTrigger);

	return (
		<header>
			<div className="max-w-screen-2xl mx-auto w-full py-4">
				<div className="font-semibold inline-flex gap-2 text-4xl items-center" style={{ fontFamily: "Helvetica, sans-serif"}}>
					<div>
						<img src="/boysenlogo%201.png" alt="BOYSEN®️" className="w-full max-w-sm"/>
					</div>
					<h1>Color Stories</h1>
				</div>
				<p>Boysen names are unique, they don't just describe the color, they evoke a feeling and tell a story.</p>
				<p>What if we imagine these stories?</p>
			</div>
		</header>
	)
}
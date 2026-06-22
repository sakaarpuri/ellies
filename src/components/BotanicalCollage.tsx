"use client";

import { BotanicalImage } from "@/components/BotanicalImage";
import { imagery } from "@/lib/site";
import { useEffect, useRef } from "react";

type BotanicalCollageProps = {
  variant?: "hero" | "quiet";
};

export function BotanicalCollage({ variant = "hero" }: BotanicalCollageProps) {
  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const collage = collageRef.current;

    if (
      variant !== "hero" ||
      !collage ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const section = collage.closest<HTMLElement>(".hero-shell");

    if (!section) {
      return;
    }

    let frame = 0;

    const updateReveal = () => {
      frame = 0;
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, (window.scrollY - section.offsetTop) / travel));

      collage.style.setProperty("--hero-main-pan", `${(-40 * progress).toFixed(2)}px`);
      collage.style.setProperty("--hero-oval-pan", `${(30 * progress).toFixed(2)}px`);
      collage.style.setProperty("--hero-leaf-pan", `${(-20 * progress).toFixed(2)}px`);
    };

    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateReveal);
      }
    };

    updateReveal();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [variant]);

  return (
    <div ref={collageRef} className={`botanical-collage ${variant}`}>
      <div className="collage-orbit" aria-hidden="true" />
      <figure className="collage-frame main">
        <BotanicalImage
          src={imagery.hero}
          alt="Turmeric roots and powder arranged on a light natural surface"
          priority
        />
      </figure>
      <figure className="collage-frame oval">
        <BotanicalImage
          src={imagery.turmeric}
          alt="Turmeric roots and powder in a rustic botanical setting"
        />
      </figure>
      <figure className="collage-frame leaf">
        <BotanicalImage src={imagery.basil} alt="Close view of fresh green herb leaves" />
      </figure>
    </div>
  );
}

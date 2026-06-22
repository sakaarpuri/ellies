"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type BotanicalImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
};

export function BotanicalImage({
  src,
  alt,
  sizes = "(max-width: 720px) 100vw, 50vw",
  priority = false,
}: BotanicalImageProps) {
  const mediaRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const media = mediaRef.current;

    if (!media || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    let visible = false;

    const updatePosition = () => {
      frame = 0;

      if (!visible) {
        return;
      }

      const frameElement = media.parentElement;

      if (!frameElement) {
        return;
      }

      const bounds = frameElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const travel = viewportHeight / 2 + bounds.height / 2;
      const distanceFromCenter = bounds.top + bounds.height / 2 - viewportHeight / 2;
      const progress = Math.max(-1, Math.min(1, distanceFromCenter / travel));
      const offset = progress * -24;

      media.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    };

    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updatePosition);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;

        if (visible) {
          requestUpdate();
        }
      },
      { rootMargin: "15% 0px" },
    );

    observer.observe(media);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <span ref={mediaRef} className="parallax-media">
      <Image
        className="image-cover"
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        unoptimized
      />
    </span>
  );
}

"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { arohiniPhotos } from "@/lib/products";

export function ProductGallery({ compact = false }: { compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const photos = compact ? arohiniPhotos.slice(0, 4) : arohiniPhotos;
  const move = (step: number) => setIndex((current) => (current + step + photos.length) % photos.length);

  return (
    <figure
      className={`product-photo product-gallery${compact ? " product-gallery-compact" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Arohini product photos"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="product-gallery-frame">
        <div className="product-gallery-stage product-arch" id={id}>
          {photos.map((photo, photoIndex) => (
            <div key={photo.src} className="product-gallery-slide" hidden={index !== photoIndex}
              role="group" aria-roledescription="slide" aria-label={`${photoIndex + 1} of ${photos.length}`}>
              <Image className="product-packshot" src={photo.src} alt={photo.alt}
                width={photo.width} height={photo.height}
                sizes={compact ? "(max-width: 760px) 240px, 300px" : "(max-width: 416px) calc(100vw - 36px), 380px"}
                priority={!compact && photoIndex === 0} />
            </div>
          ))}
        </div>
      </div>
      <figcaption className="product-gallery-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous product photo" title="Previous photo" aria-controls={id}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <span className="product-gallery-caption" aria-live="polite" aria-atomic="true">
          <span className="product-gallery-count">{index + 1} / {photos.length}</span>
        </span>
        <button type="button" onClick={() => move(1)} aria-label="Next product photo" title="Next photo" aria-controls={id}>
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </figcaption>
      <div className="product-gallery-thumbnails" aria-label="Choose a product photo">
        {photos.map((photo, photoIndex) => (
          <button key={photo.src} type="button" onClick={() => setIndex(photoIndex)}
            aria-label={`Show photo ${photoIndex + 1}: ${photo.alt}`} title={`Photo ${photoIndex + 1}`}
            aria-pressed={index === photoIndex} aria-controls={id}>
            <Image src={photo.src} alt="" width={54} height={64} sizes="54px" />
          </button>
        ))}
      </div>
    </figure>
  );
}

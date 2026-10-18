"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { arohini } from "@/lib/products";

const captions = ["Bottle & packaging", "Arohini wellness poster"];

export function ProductGallery() {
  const [index, setIndex] = useState(0);
  const move = (step: number) => setIndex((current) => (current + step + captions.length) % captions.length);

  return (
    <figure
      className="product-photo product-gallery"
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
      <div className="product-gallery-stage" id="arohini-gallery-photo">
        <div className="product-gallery-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${captions.length}: ${captions[index]}`}>
          {index === 0 ? (
            <Image
              className="product-packshot"
              src={arohini.image}
              alt="Arohini women's wellness 40+ elixir, 200 ml bottle with its box"
              width={1122}
              height={1402}
              sizes="(max-width: 760px) 100vw, 520px"
              priority
            />
          ) : (
            <div className="product-poster">
              {/* Display only panel one of the supplied brochure, without redrawing its artwork. */}
              <Image
                src="/images/arohini-wellness-brochure.png"
                alt="Arohini women's wellness 40+ poster with a woman beside the bottle and box, headed Support women through every stage of life"
                width={427}
                height={640}
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
      <figcaption className="product-gallery-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous product photo" title="Previous photo" aria-controls="arohini-gallery-photo">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <span className="product-gallery-caption" aria-live="polite" aria-atomic="true">
          <span>{captions[index]}</span>
          <span className="product-gallery-count">{index + 1} / {captions.length}</span>
        </span>
        <button type="button" onClick={() => move(1)} aria-label="Next product photo" title="Next photo" aria-controls="arohini-gallery-photo">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </figcaption>
    </figure>
  );
}

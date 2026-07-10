import type { CSSProperties } from "react";
import { BotanicalImage } from "@/components/BotanicalImage";
import { imagery } from "@/lib/site";

const ribbonImages = [
  {
    label: "Ingredients",
    src: imagery.driedHerbs,
    alt: "Dried herbs arranged in small bowls for herbal preparation",
  },
  {
    label: "Preparation",
    src: imagery.oils,
    alt: "Clear glass bottles of botanical oil with fresh flowers",
  },
  {
    label: "Daily ritual",
    src: imagery.roots,
    alt: "Herbal tea and dried botanicals arranged on a wooden tray",
  },
];

export function BotanicalRibbon() {
  return (
    <section className="botanical-ribbon" aria-label="Botanical preparation visuals">
      {ribbonImages.map((item, index) => (
        <figure
          key={item.label}
          className={index === 1 ? "tall" : undefined}
          style={{ "--index": index } as CSSProperties}
        >
          <BotanicalImage src={item.src} alt={item.alt} sizes="(max-width: 720px) 100vw, 33vw" />
          <figcaption>{item.label}</figcaption>
        </figure>
      ))}
    </section>
  );
}

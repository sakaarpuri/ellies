import { BotanicalImage } from "@/components/BotanicalImage";
import { imagery } from "@/lib/site";

type BotanicalCollageProps = {
  variant?: "hero" | "quiet";
};

export function BotanicalCollage({ variant = "hero" }: BotanicalCollageProps) {
  return (
    <div className={`botanical-collage ${variant}`}>
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

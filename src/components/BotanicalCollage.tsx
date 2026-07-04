import { BotanicalImage } from "@/components/BotanicalImage";
import { imagery } from "@/lib/site";

type BotanicalCollageProps = {
  variant?: "hero" | "quiet";
};

export function BotanicalCollage({ variant = "hero" }: BotanicalCollageProps) {
  return (
    <div className={`botanical-collage ${variant}`}>
      <figure className="collage-frame main">
        <BotanicalImage
          src={imagery.hero}
          alt="Fresh tulsi leaves in a natural botanical setting"
          priority
        />
      </figure>
      <figure className="collage-frame oval">
        <BotanicalImage
          src={imagery.turmeric}
          alt="Haldi roots arranged on a light natural surface"
        />
      </figure>
      <p>Tulsi and haldi — herbs from every Indian kitchen</p>
    </div>
  );
}

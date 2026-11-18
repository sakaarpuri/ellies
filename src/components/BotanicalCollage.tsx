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
          src={imagery.tulsi}
          alt="Krishna Tulsi with green leaves, purple stems and flowering spikes"
          sizes="(max-width: 980px) 48vw, 26vw"
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

import Image from "next/image";
import { arohiniHerbPhotos } from "@/lib/products";

export function ArohiniHerbs({ showSources = false }: { showSources?: boolean }) {
  const Heading = showSources ? "h2" : "h3";
  const HerbHeading = showSources ? "h3" : "h4";
  return (
    <div className="arohini-herb-stories">
      <div className="arohini-herb-heading">
        <p className="eyebrow">Inside the blend</p>
        <Heading>Three of our seven botanicals.</Heading>
      </div>
      <div className="arohini-herb-grid">
        {arohiniHerbPhotos.map((herb) => (
          <figure key={herb.name} className="arohini-herb-photo">
            <Image src={herb.src} alt={herb.alt} width={900} height={1200}
              sizes="(max-width: 540px) 104px, (max-width: 760px) 30vw, (max-width: 1050px) 104px, 220px" />
            <figcaption>
              <HerbHeading>{herb.name}</HerbHeading>
              <p>{herb.benefit}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="arohini-herb-note">Traditional uses relate to individual herbs, not proven effects of the finished blend.</p>
      {showSources && (
        <details className="arohini-herb-sources">
          <summary>Ingredient references</summary>
          <ul>{arohiniHerbPhotos.map((herb) => <li key={herb.name}><a href={herb.source}>{herb.name}: traditional use and evidence</a></li>)}</ul>
        </details>
      )}
    </div>
  );
}

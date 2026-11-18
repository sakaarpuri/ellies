import Image from "next/image";
import { arohiniBotanicals } from "@/lib/products";

export function ArohiniHerbs({ onHomePage = false }: { onHomePage?: boolean }) {
  const Heading = onHomePage ? "h3" : "h2";
  const HerbHeading = onHomePage ? "h4" : "h3";
  return (
    <section className="arohini-herb-stories" aria-labelledby="arohini-herbs-heading">
      <div className="arohini-herb-heading">
        <Heading id="arohini-herbs-heading">The seven botanicals</Heading>
        <p>Traditional uses in Ayurveda</p>
      </div>
      <div className="arohini-herb-grid">
        {arohiniBotanicals.map((herb) => (
          <figure key={herb.name} id={`ingredient-${herb.name.toLowerCase()}`} className="arohini-herb-photo">
            <div className="arohini-herb-image">
              <Image
                src={`/images/arohini-herb-${herb.name.toLowerCase()}.webp`}
                alt={herb.alt}
                fill
                sizes="(max-width: 370px) 45vw, (max-width: 760px) 33vw, 200px"
              />
            </div>
            <figcaption>
              <HerbHeading>{herb.name}</HerbHeading>
              <em>{herb.latin}</em>
              <p>{herb.use}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

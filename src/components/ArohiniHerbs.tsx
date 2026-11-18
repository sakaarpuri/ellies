import Image from "next/image";
import { arohiniBotanicals } from "@/lib/products";

export function ArohiniHerbs() {
  return (
    <section className="arohini-herb-stories" aria-labelledby="arohini-herbs-heading">
      <h2 id="arohini-herbs-heading">The seven botanicals</h2>
      <div className="arohini-herb-grid">
        {arohiniBotanicals.map((herb) => (
          <figure key={herb.name} id={`ingredient-${herb.name.toLowerCase()}`} className="arohini-herb-photo">
            <div className="arohini-herb-image">
              <Image
                src={`/images/arohini-herb-${herb.name.toLowerCase()}.webp`}
                alt={herb.alt}
                fill
                sizes="(max-width: 639px) 45vw, (max-width: 1179px) 23vw, 180px"
              />
            </div>
            <figcaption>
              <h3>{herb.name}</h3>
              <em>{herb.latin}</em>
              <p>{herb.use}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

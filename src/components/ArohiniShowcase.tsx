import Link from "next/link";
import { ArohiniIntroduction } from "@/components/ArohiniIntroduction";
import { ProductGallery } from "@/components/ProductGallery";
import { ArohiniHerbs } from "@/components/ArohiniHerbs";

export function ArohiniShowcase() {
  return (
    <section className="home-product product-light" id="meet-arohini" aria-labelledby="arohini-title">
      <ProductGallery lazy><ArohiniHerbs onHomePage /></ProductGallery>
      <div className="home-product-copy">
        <p className="eyebrow sage">Women&apos;s wellness 40+</p>
        <h2 id="arohini-title">Meet Arohini.</h2>
        <ArohiniIntroduction onHomePage />
        <Link className="button primary" href="/products/arohini">Discover Arohini</Link>
      </div>
    </section>
  );
}

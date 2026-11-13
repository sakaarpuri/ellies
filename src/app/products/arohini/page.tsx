import Link from "next/link";
import { ProductGallery } from "@/components/ProductGallery";
import { arohini, arohiniBotanicals, arohiniFaqs, arohiniPhotos } from "@/lib/products";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { JsonLdScript } from "@/components/JsonLd";
import { ArohiniIntroduction } from "@/components/ArohiniIntroduction";

export const metadata = pageMetadata({
  title: "Arohini: Sugar-Free Ayurvedic Elixir for Women 40+",
  description:
    `Arohini is a sugar-free Ayurvedic botanical elixir for women's wellness 40+ around menopause. 200 ml, Rs.${arohini.price} with free delivery in India.`,
  path: arohini.path,
  image: arohini.image,
  imageAlt: "Arohini 200 ml bottle and packaging",
});

export default function ArohiniPage() {
  return (
    <>
      <section className="product-layout">
        <ProductGallery />
        <div className="product-copy">
          <p className="eyebrow sage">
            Ellie&apos;s Botanics · Women&apos;s wellness 40+
          </p>
          <h1>Arohini</h1>
          <ArohiniIntroduction />
          <dl className="product-facts">
            <div>
              <dt>Format</dt>
              <dd>Botanical elixir</dd>
            </div>
            <div>
              <dt>Pack size</dt>
              <dd>200 ml</dd>
            </div>
            <div>
              <dt>Botanicals</dt>
              <dd>Seven</dd>
            </div>
          </dl>
          <div className="product-price">
            <strong>₹{arohini.price}</strong>
            <span>Free delivery within India</span>
          </div>
          <Link className="button primary product-buy" href="/checkout/arohini">
            Buy Arohini
          </Link>
          <p className="product-small">
            Questions before ordering? <Link href="/contact">Talk to us</Link>.
          </p>
        </div>
      </section>
      <section className="product-editorial">
        <div className="product-section-inner">
          <div className="product-section-heading">
            <p className="eyebrow">The botanical blend</p>
            <h2>
              Seven herbs.
              <br />A shared tradition of care.
            </h2>
            <p>
              Meet the botanicals in Arohini. These descriptions explain their
              place in Ayurveda; traditional use is not proof that this blend
              treats a medical condition.
            </p>
          </div>
          <div className="botanical-list">
            {arohiniBotanicals.map(([name, latin, description], index) => (
              <article key={name} id={`ingredient-${name.toLowerCase()}`}>
                <span className="botanical-number">0{index + 1}</span>
                <div>
                  <h3>{name}</h3>
                  <em>{latin}</em>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="product-guidance">
        <div>
          <p className="eyebrow sage">A thoughtful routine</p>
          <h2>Wellbeing is more than one bottle.</h2>
          <p>
            Arohini belongs alongside a balanced diet, regular activity, restful
            sleep and appropriate medical care. It is not a replacement for
            prescribed treatment.
          </p>
          <Link href="/education" className="text-link">
            Explore herbal wisdom
          </Link>
          <div className="menopause-guidance">
            <h3>Questions before or after menopause?</h3>
            <p>
              Looking for relief from fatigue, joint pain or other symptoms?
              Speak with a qualified practitioner about what you are experiencing
              and the care options that may suit you.
            </p>
            <Link href="/#joint-comfort-check-in" className="text-link">
              Request a consultation
            </Link>
          </div>
        </div>
        <div className="product-questions" aria-labelledby="arohini-questions-title">
          <h2 id="arohini-questions-title">Arohini, at a glance.</h2>
          {arohiniFaqs.map(({ question, answer }, index) => (
            <details key={question} open={index === 0}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
          <Link href="/contact" className="text-link">Ask us about Arohini</Link>
        </div>
      </section>
      <JsonLdScript
        data={[
          {
            ...webPageJsonLd({ path: arohini.path, name: "Arohini Women's Wellness 40+", description: arohini.description }),
            mainEntity: { "@id": `${absoluteUrl(arohini.path)}#product` },
            dateModified: arohini.updatedAt,
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Arohini", path: arohini.path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${absoluteUrl(arohini.path)}#product`,
            url: absoluteUrl(arohini.path),
            name: "Arohini Women's Wellness 40+ 200 ml",
            description: arohini.description,
            image: [absoluteUrl(arohini.image), ...arohiniPhotos.map((photo) => absoluteUrl(photo.src))],
            sku: "AROHINI-200",
            size: "200 ml",
            category: "Ayurvedic botanical elixir",
            additionalProperty: [
              { "@type": "PropertyValue", name: "Botanicals", value: arohiniBotanicals.map(([name]) => name).join(", ") },
              { "@type": "PropertyValue", name: "Formulation", value: "Sugar-free; no artificial sweeteners" },
            ],
            brand: { "@type": "Brand", name: "Ellie's Botanics" },
            offers: {
              "@type": "Offer",
              url: absoluteUrl(arohini.path),
              price: arohini.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: { "@id": `${absoluteUrl()}/#organization` },
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: 0,
                  currency: "INR",
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "IN",
                },
              },
            },
          },
        ]}
      />
    </>
  );
}

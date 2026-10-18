import Image from "next/image";
import Link from "next/link";
import { arohini, arohiniBotanicals } from "@/lib/products";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLdScript } from "@/components/JsonLd";

export const metadata = pageMetadata({
  title: "Arohini | Women's Wellness 40+",
  description:
    "Meet Arohini, a sugar-free Ayurvedic botanical elixir for women 40+. Seven botanicals, 200 ml, Rs.250 with free delivery in India.",
  path: arohini.path,
  image: arohini.image,
  imageAlt: "Arohini 200 ml bottle and packaging",
});

export default function ArohiniPage() {
  return (
    <>
      <section className="product-layout">
        <figure className="product-photo">
          <Image
            src={arohini.image}
            alt="Arohini women's wellness 40+ elixir, 200 ml bottle with its box"
            width={1122}
            height={1402}
            sizes="(max-width: 760px) 100vw, 50vw"
            priority
          />
        </figure>
        <div className="product-copy">
          <p className="eyebrow sage">
            Ellie&apos;s Botanics · Women&apos;s wellness 40+
          </p>
          <h1>Arohini</h1>
          <p className="product-subtitle">Care for your next chapter.</p>
          <p>
            A sugar-free Ayurvedic botanical elixir, bringing together seven
            botanicals in a daily wellness preparation for women aged 40 and
            beyond.
          </p>
          <p>
            Changing routines, new priorities, a little more time for yourself.
            Make space for your wellbeing, alongside nourishing food, movement,
            rest and the care you need.
          </p>
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
            <strong>₹250</strong>
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
              <article key={name}>
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
        </div>
        <div className="product-questions">
          <details open>
            <summary>How should I use Arohini?</summary>
            <p>
              Follow the directions and warnings on your bottle, or the advice
              of your qualified practitioner. Do not exceed the labelled dose.
            </p>
          </details>
          <details>
            <summary>Is it suitable for everyone?</summary>
            <p>
              No herbal preparation is right for everyone. Check with a
              qualified doctor before use, especially if you take medication,
              have a health condition, are pregnant or breastfeeding. Stop use
              and seek advice if you experience an adverse reaction.
            </p>
            <Link href="/#joint-comfort-check-in">Request a consultation</Link>
          </details>
          <details>
            <summary>What happens after I order?</summary>
            <p>
              After successful payment, you will see your order confirmation and
              reference. We use the email address you provide for order and
              delivery updates. Please keep your order reference for any
              questions.
            </p>
          </details>
          <details>
            <summary>Where do you deliver?</summary>
            <p>
              Delivery is free within India. Enter your complete address and PIN
              code at checkout. For delivery questions or help with an order,
              email{" "}
              <a href="mailto:support@elliesbotanics.com">
                support@elliesbotanics.com
              </a>
              .
            </p>
          </details>
        </div>
      </section>
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Arohini", path: arohini.path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Arohini Women's Wellness 40+ 200 ml",
            description: arohini.description,
            image: absoluteUrl(arohini.image),
            sku: "AROHINI-200",
            brand: { "@type": "Brand", name: "Ellie's Botanics" },
            offers: {
              "@type": "Offer",
              url: absoluteUrl(arohini.path),
              price: arohini.price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
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

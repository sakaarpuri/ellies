import type { Metadata } from "next";
import { arohini } from "@/lib/products";
import { JsonLdScript } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const description =
  "Terms of use for Ellie’s Botanics herbal wellness education, website content, and consultation enquiry information.";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <section className="legal-page">
        <p className="eyebrow">Terms</p>
        <h1>Terms of Use</h1>
        <p>
          Website articles provide general, Ayurveda-informed education.
          Individual assessment and recommendations are provided separately
          through qualified consultation. Ellie&apos;s Botanics may update site
          content and policies over time.
        </p>
        <h2>Orders and delivery</h2>
        <p>
          Product prices and the total payable are displayed before payment.
          Arohini is Rs.{arohini.price} per 200 ml bottle with free delivery within India.
          {" "}{arohini.deliveryEstimate} For international orders, email{" "}
          <a href={`mailto:${site.email}?subject=International%20Arohini%20order`}>
            {site.email}
          </a>.
          Provide an accurate address and contact number. Our team will share
          delivery updates. For cancellation, return, damaged delivery or
          refund queries, contact {site.email} with your order reference.
          Your statutory rights still apply.
        </p>
        <h2>Content use</h2>
        <p>
          Site text, layout, and visual presentation belong to Ellie&apos;s
          Botanics unless otherwise noted. Please request permission before
          reusing original content.
        </p>
        <h2>External references</h2>
        <p>
          Links and references are provided for context. Ellie&apos;s Botanics
          is not responsible for third-party websites.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:support@elliesbotanics.com">
            support@elliesbotanics.com
          </a>
          .
        </p>
      </section>
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/terms",
            name: "Terms of Use",
            description,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Terms", path: "/terms" },
          ]),
        ]}
      />
    </>
  );
}

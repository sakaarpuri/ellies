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
          {" "}{arohini.deliveryEstimate}
          {" "}
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
        <p>
          Checkout address suggestions use the{" "}
          <a href="https://www.geonames.org/export/zip/">GeoNames postal directory</a>{" "}
          under the <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0 licence</a>.
        </p>
        <p>
          The{" "}
          <a href="https://commons.wikimedia.org/wiki/File:A_flourishing_Krishna_Tulsi_shrub_featuring_distinctive_purplish_stems_and_small_flowering_spikes_growing_in_a_home_garden_in_Assam._01.jpg">
            Krishna Tulsi photograph
          </a>{" "}
          by AjayDas was cropped and resized for this site and is shared under the{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0 licence</a>.
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

import type { Metadata } from "next";
import { JsonLdScript } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

const description =
  "Privacy information for Ellie’s Botanics contact, consultation enquiry, and website communication records.";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <section className="legal-page">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy Policy</h1>
        <p>
          When you contact Ellie&apos;s Botanics by email, phone, WhatsApp, or
          the consultation form, your information is used to respond to your
          enquiry, coordinate requested guidance, and maintain relevant
          communication records.
        </p>
        <h2>Information we may receive</h2>
        <p>
          Your name, email address, phone number, message content, and basic
          website analytics may be received when you interact with the site.
        </p>
        <h2>How we use it</h2>
        <p>
          For purchases, we collect your delivery address, order details and
          payment reference to process the order and provide updates.
          Consultation requests may include health information you choose to
          share. Records are stored privately through our hosting provider and
          Google Sheets, and authorised administrators use them to respond.
          Email confirmations and service notifications may be sent through
          Google. Card and payment credentials are handled by the payment
          provider, not stored by this website.
        </p>
        <p>
          We use information for communication, site improvement, and record
          keeping. We do not sell personal information.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy questions, write to{" "}
          <a href="mailto:support@elliesbotanics.com">
            support@elliesbotanics.com
          </a>
          .
        </p>
      </section>
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/privacy",
            name: "Privacy Policy",
            description,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Privacy", path: "/privacy" },
          ]),
        ]}
      />
    </>
  );
}

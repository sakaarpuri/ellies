import type { Metadata } from "next";
import { BotanicalCollage } from "@/components/BotanicalCollage";
import { ContactCTA } from "@/components/ContactCTA";
import { DisclaimerCallout } from "@/components/DisclaimerCallout";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ellie's Botanics and its careful approach to herbal wellness education.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero split">
        <div>
          <p className="eyebrow">About Ellie&apos;s Botanics</p>
          <h1>A gentle place for herbal wisdom and everyday care.</h1>
          <p>
            Ellie&apos;s Botanics shares beautiful, readable, responsible information for people
            who want to understand herbs with more calm and confidence.
          </p>
        </div>
        <BotanicalCollage variant="quiet" />
      </section>

      <section className="editorial-section">
        <SectionHeader
          eyebrow="Our Intention"
          title="To make herbal knowledge feel clear, careful, and human."
        />
        <div className="editorial-copy">
          <p>
            The world of herbal wellness can feel either too clinical or too mystical. Ellie&apos;s
            Botanics wants to sit in the useful middle: rooted in Ayurveda-inspired thinking,
            respectful of traditional plant knowledge, and honest about the limits of general
            education.
          </p>
          <p>
            Here, you will find grounded writing on plant traditions, daily rhythms, careful use,
            and the small routines that help self-care feel more attentive.
          </p>
        </div>
      </section>

      <section className="values-list">
        <div>
          <p className="eyebrow">What We Value</p>
          <h2>Care before claims.</h2>
        </div>
        <dl>
          <div>
            <dt>Clarity</dt>
            <dd>Plain-language education that helps readers orient themselves.</dd>
          </div>
          <div>
            <dt>Respect</dt>
            <dd>Traditional knowledge is handled with context, not reduced to trends.</dd>
          </div>
          <div>
            <dt>Responsibility</dt>
            <dd>We avoid dramatic wellness promises and encourage professional guidance.</dd>
          </div>
          <div>
            <dt>Beauty</dt>
            <dd>The experience should feel calm, precise, and worthy of attention.</dd>
          </div>
        </dl>
      </section>

      <DisclaimerCallout />
      <ContactCTA />
    </>
  );
}

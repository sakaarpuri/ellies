import type { Metadata } from "next";
import { BotanicalCollage } from "@/components/BotanicalCollage";
import { ContactCTA } from "@/components/ContactCTA";
import { DisclaimerCallout } from "@/components/DisclaimerCallout";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ellie's Botanics and its Ayurveda-informed approach to herbal wellness education.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero split">
        <div>
          <p className="eyebrow">About Ellie&apos;s Botanics</p>
          <h1>Ayurvedic knowledge for informed, everyday wellness.</h1>
          <p>
            Ellie&apos;s Botanics brings together traditional botanical knowledge, clear modern
            communication, and access to qualified Ayurvedic consultation.
          </p>
        </div>
        <BotanicalCollage variant="quiet" />
      </section>

      <section className="editorial-section">
        <SectionHeader
          eyebrow="Our Perspective"
          title="Tradition, context, and responsible application."
        />
        <div className="editorial-copy">
          <p>
            Ayurveda approaches wellness through the relationship between constitution, season,
            daily routine, food, rest, movement, and botanical preparations. Each element is
            understood in context rather than in isolation.
          </p>
          <p>
            Ellie&apos;s Botanics organizes this knowledge into clear resources on herbal traditions,
            daily rhythms, preparation methods, and responsible use, with qualified consultation
            available for individual guidance.
          </p>
        </div>
      </section>

      <section className="values-list">
        <div>
          <p className="eyebrow">What We Value</p>
          <h2>Knowledge with standards.</h2>
        </div>
        <dl>
          <div>
            <dt>Clarity</dt>
            <dd>Plain-language explanations of Ayurvedic and botanical principles.</dd>
          </div>
          <div>
            <dt>Respect</dt>
            <dd>Traditional knowledge is handled with context, not reduced to trends.</dd>
          </div>
          <div>
            <dt>Responsibility</dt>
            <dd>Measured claims, individual context, and professional guidance when required.</dd>
          </div>
          <div>
            <dt>Precision</dt>
            <dd>Careful attention to ingredients, preparation, terminology, and intended use.</dd>
          </div>
        </dl>
      </section>

      <DisclaimerCallout />
      <ContactCTA />
    </>
  );
}

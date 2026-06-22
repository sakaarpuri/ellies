import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { BotanicalImage } from "@/components/BotanicalImage";
import { BotanicalCollage } from "@/components/BotanicalCollage";
import { ConsultationIntakeSection } from "@/components/ConsultationIntakeSection";
import { ConsultationPanel } from "@/components/ConsultationPanel";
import { ContactCTA } from "@/components/ContactCTA";
import { DisclaimerCallout } from "@/components/DisclaimerCallout";
import { SectionHeader } from "@/components/SectionHeader";
import { getFeaturedPosts } from "@/lib/wisdom";
import { imagery } from "@/lib/site";

const pillars = [
  {
    label: "01",
    title: "Ayurvedic Foundations",
    body: "Established Ayurvedic principles and long-practiced botanical traditions inform every educational resource.",
  },
  {
    label: "02",
    title: "Ingredient Standards",
    body: "Plant identity, quality, preparation, and intended use are essential to responsible herbal care.",
  },
  {
    label: "03",
    title: "Practical Application",
    body: "Traditional principles are presented as clear, realistic guidance for contemporary wellness routines.",
  },
];

export default function Home() {
  const featuredPosts = getFeaturedPosts(3);

  return (
    <>
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Botanical Wellness Notes</p>
          <h1>Rooted in herbal wisdom. Made for modern wellness.</h1>
          <p>
            Ellie&apos;s Botanics presents Ayurveda-informed guidance on herbs, daily routines, and
            responsible self-care for modern life.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/education">
              Explore herbal wisdom
            </Link>
            <Link className="button secondary" href="/about">
              About Ellie&apos;s Botanics
            </Link>
          </div>
        </div>
        <BotanicalCollage />
      </section>

      <ConsultationIntakeSection />

      <section className="intro-section">
        <div className="rule-label">Ellie&apos;s Botanics</div>
        <div className="intro-grid">
          <h2>Traditional herbal knowledge, thoughtfully presented for modern life.</h2>
          <p>
            Explore clear, responsible writing on Ayurvedic herbs, everyday wellness practices, and
            safe use, designed to help you ask better questions and make informed choices.
          </p>
        </div>
      </section>

      <section className="why-section">
        <figure className="tall-image">
          <BotanicalImage src={imagery.roots} alt="Dried botanical roots arranged on a light surface" />
        </figure>
        <div className="why-copy">
          <SectionHeader
            eyebrow="Herbal Care In Context"
            title="Responsible herbal care begins with the right plant, preparation, and context."
            body="Ayurveda considers the individual, season, preparation, and routine together. Understanding that context is essential to applying herbal knowledge responsibly."
          />
          <div className="text-columns">
            <p>
              Botanical traditions are structured systems of knowledge. Plant part, preparation,
              timing, quality, and individual suitability all influence how an herb is understood
              and used.
            </p>
            <p>
              Ellie&apos;s Botanics explains these principles in clear language, connecting
              traditional Ayurvedic knowledge with responsible contemporary practice.
            </p>
          </div>
        </div>
      </section>

      <section className="pillars-section">
        <SectionHeader
          eyebrow="Our Approach"
          title="A disciplined approach to herbal wellness."
        />
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="pillar">
              <span>{pillar.label}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <ConsultationPanel />

      <section className="featured-section">
        <SectionHeader
          eyebrow="Herbal Wisdom"
          title="Explore Ayurveda and herbal wellness."
          body="Clear introductions to herbal preparations, Ayurvedic principles, daily routines, and responsible use."
        />
        <div className="article-grid">
          {featuredPosts.map((post, index) => (
            <ArticleCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>

      <DisclaimerCallout />
      <ContactCTA />
    </>
  );
}

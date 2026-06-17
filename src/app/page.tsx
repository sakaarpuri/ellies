import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { BotanicalImage } from "@/components/BotanicalImage";
import { BotanicalCollage } from "@/components/BotanicalCollage";
import { ContactCTA } from "@/components/ContactCTA";
import { DisclaimerCallout } from "@/components/DisclaimerCallout";
import { SectionHeader } from "@/components/SectionHeader";
import { getFeaturedPosts } from "@/lib/wisdom";
import { imagery } from "@/lib/site";

const pillars = [
  {
    label: "01",
    title: "Traditional Knowledge",
    body: "We look to long-practiced botanical traditions with respect, context, and humility.",
  },
  {
    label: "02",
    title: "Careful Sourcing Intent",
    body: "Plant quality, thoughtful preparation, and clear information all shape how herbal care is understood.",
  },
  {
    label: "03",
    title: "Everyday Wellness",
    body: "The focus is small, repeatable routines that help people approach self-care with more attention.",
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
            Ellie&apos;s Botanics shares thoughtful writing on herbal traditions, Ayurveda-inspired
            routines, and the careful way plant knowledge can support everyday self-care.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/education">
              Explore herbal wisdom
            </Link>
            <Link className="button secondary" href="/about">
              Our intention
            </Link>
          </div>
        </div>
        <BotanicalCollage />
      </section>

      <section className="intro-section">
        <div className="rule-label">Ellie&apos;s Botanics</div>
        <div className="intro-grid">
          <h2>A calm place to learn about herbs with clarity and care.</h2>
          <p>
            Many people are curious about herbs but unsure where to begin. Ellie&apos;s Botanics
            makes the first step clearer with simple explanations, careful framing, and respect for
            both traditional wisdom and modern caution.
          </p>
        </div>
      </section>

      <section className="why-section">
        <figure className="tall-image">
          <BotanicalImage src={imagery.roots} alt="Dried botanical roots arranged on a light surface" />
        </figure>
        <div className="why-copy">
          <SectionHeader
            eyebrow="Why Herbal Solutions?"
            title="Plants have always been part of how people care, cook, rest, and restore."
            body="The useful question is not whether nature is trendy. It is how to approach plant-based wellness with enough patience, context, and responsibility to make it meaningful."
          />
          <div className="text-columns">
            <p>
              Herbal traditions often begin with observation: season, constitution, preparation,
              routine, and rhythm. Ellie&apos;s Botanics translates those ideas into accessible
              reading without making dramatic promises.
            </p>
            <p>
              The aim is simple: information that is beautiful enough to invite attention, clear
              enough to be useful, and careful enough to read with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="pillars-section">
        <SectionHeader
          eyebrow="Our Foundation"
          title="Herbal learning shaped by clarity, patience, and respect."
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

      <section className="featured-section">
        <SectionHeader
          eyebrow="Herbal Wisdom"
          title="Begin with gentle, grounded reading."
          body="Short educational notes for people exploring herbal and Ayurveda-inspired care without hype."
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

import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { SectionHeader } from "@/components/SectionHeader";
import { getAllPosts } from "@/lib/wisdom";

const categories = [
  {
    title: "Herbal Basics",
    body: "Accessible introductions to leaves, roots, oils, preparations, and the language of botanical care.",
  },
  {
    title: "Ayurveda & Daily Wellness",
    body: "Gentle explanations of balance, routine, seasonality, and everyday self-care ideas.",
  },
  {
    title: "Ingredients & Traditions",
    body: "A closer look at familiar botanicals and the cultural context around their use.",
  },
  {
    title: "Safe Use & Responsible Care",
    body: "Careful notes on reading wellness advice, asking better questions, and knowing when to seek guidance.",
  },
];

export const metadata: Metadata = {
  title: "Herbal Wisdom",
  description:
    "Explore Ellie's Botanics educational guide to herbal basics, Ayurveda-inspired wellness, ingredients, and responsible care.",
};

export default function EducationPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Herbal Wisdom</p>
        <h1>A reading room for plant-based wellness, built with restraint.</h1>
        <p>
          Start here if you are curious about herbs, Ayurveda-inspired routines, or the difference
          between useful education and overconfident wellness noise.
        </p>
      </section>

      <section className="education-grid" aria-label="Education categories">
        {categories.map((category) => (
          <article key={category.title}>
            <h2>{category.title}</h2>
            <p>{category.body}</p>
          </article>
        ))}
      </section>

      <section className="learning-path">
        <SectionHeader
          eyebrow="Suggested Path"
          title="Five useful first reads."
          body="These articles build from broad orientation to everyday practice."
        />
        <ol>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/education/${post.slug}`}>
                <span>{post.category}</span>
                {post.title}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <ContactCTA />
    </>
  );
}

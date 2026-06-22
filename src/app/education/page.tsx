import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { SectionHeader } from "@/components/SectionHeader";
import { getAllPosts } from "@/lib/wisdom";

const categories = [
  {
    title: "Herbal Basics",
    body: "Foundational guidance on leaves, roots, oils, preparations, and the language of botanical care.",
  },
  {
    title: "Ayurveda & Daily Wellness",
    body: "Core Ayurvedic principles of balance, routine, seasonality, and everyday self-care.",
  },
  {
    title: "Ingredients & Traditions",
    body: "A closer look at familiar botanicals and the cultural context around their use.",
  },
  {
    title: "Safe Use & Responsible Care",
    body: "Practical standards for evaluating wellness advice, understanding limits, and seeking qualified guidance.",
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
        <h1>A structured guide to herbs, Ayurveda, and responsible use.</h1>
        <p>
          Explore foundational concepts, preparation methods, daily wellness practices, and the
          standards that distinguish responsible herbal guidance.
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
          eyebrow="Suggested Reading"
          title="Five foundational articles."
          body="Follow the series from core herbal concepts to informed everyday practice."
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

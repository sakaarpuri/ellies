import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { JsonLdScript } from "@/components/JsonLd";
import { SectionHeader } from "@/components/SectionHeader";
import { getAllPosts } from "@/lib/wisdom";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

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

const description =
  "Explore Ellie’s Botanics Herbal Wisdom guide to Ayurvedic herbs, daily wellness, ingredient traditions, and responsible herbal care.";

export const metadata: Metadata = pageMetadata({
  title: "Herbal Wisdom | Ayurvedic Herbs and Responsible Wellness",
  description,
  path: "/education",
});

const educationFaqs = [
  {
    question: "What can I learn in Herbal Wisdom?",
    answer:
      "Herbal Wisdom explains Ayurvedic principles, botanical preparations, ingredient context, daily routines, and responsible use in plain language.",
  },
  {
    question: "Is this content a personal recommendation?",
    answer:
      "No. The articles provide general education. Individual suitability depends on health history, medicines, routine, and personal needs.",
  },
  {
    question: "How should I use herbal education safely?",
    answer:
      "Use herbal education to ask better questions, check preparation and dosage context, read labels carefully, and seek professional guidance for personal concerns.",
  },
];

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

      <section className="faq-section" aria-labelledby="education-faq-title">
        <div>
          <p className="eyebrow">Helpful Context</p>
          <h2 id="education-faq-title">How to read Herbal Wisdom.</h2>
        </div>
        <div className="faq-list">
          {educationFaqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <ContactCTA />
      <JsonLdScript
        data={[
          webPageJsonLd({
            path: "/education",
            name: "Herbal Wisdom",
            description,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Herbal Wisdom", path: "/education" },
          ]),
          faqJsonLd(educationFaqs),
        ]}
      />
    </>
  );
}

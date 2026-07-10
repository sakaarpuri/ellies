"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { BotanicalImage } from "@/components/BotanicalImage";

type JournalPost = {
  title: string;
  slug: string;
  category: string;
  readingTime: string;
  heroImage: string;
};

type JournalListProps = {
  posts: JournalPost[];
};

const categories = [
  { label: "All", value: "all" },
  { label: "Herbal Basics", value: "Herbal Basics" },
  { label: "Daily Wellness", value: "Ayurveda & Daily Wellness" },
  { label: "Safe Use", value: "Safe Use & Responsible Care" },
  { label: "Ingredients", value: "Ingredients & Traditions" },
];

export function JournalList({ posts }: JournalListProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "all";
  const visiblePosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <>
      <div className="journal-filters" aria-label="Journal categories">
        {categories.map((category) => (
          <Link
            key={category.value}
            className={selectedCategory === category.value ? "active" : ""}
            href={
              category.value === "all"
                ? "/education"
                : `/education?category=${encodeURIComponent(category.value)}`
            }
          >
            {category.label}
          </Link>
        ))}
      </div>

      <section className="journal-list" aria-label="Journal articles">
        {visiblePosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/education/${post.slug}`}
            className="journal-list-row"
            style={{ "--index": index } as CSSProperties}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>
              <strong>{post.title}</strong>
              <small>
                {post.category} · {post.readingTime.replace(" read", "")}
              </small>
            </span>
            <figure>
              <BotanicalImage src={post.heroImage} alt={`Botanical visual for ${post.title}`} />
            </figure>
          </Link>
        ))}
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotanicalImage } from "@/components/BotanicalImage";
import { ContactCTA } from "@/components/ContactCTA";
import { DisclaimerCallout } from "@/components/DisclaimerCallout";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/wisdom";
import { site } from "@/lib/site";

type WisdomArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: WisdomArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${site.url}/education/${post.slug}`,
      images: [{ url: post.heroImage, alt: `Botanical visual for ${post.title}` }],
    },
  };
}

export default async function WisdomArticlePage({ params }: WisdomArticlePageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: site.name,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
    },
    image: `${site.url}${post.heroImage}`,
    mainEntityOfPage: `${site.url}/education/${post.slug}`,
  };

  return (
    <>
      <article className="article-page">
        <header className="article-hero">
          <div>
            <p className="eyebrow">{post.category}</p>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <div className="article-meta large">
              <span>
                {new Intl.DateTimeFormat("en", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(post.date))}
              </span>
              <span>{post.readingTime}</span>
            </div>
          </div>
          <figure>
            <BotanicalImage src={post.heroImage} alt={`Botanical visual for ${post.title}`} priority />
          </figure>
        </header>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </article>
      <DisclaimerCallout />
      <ContactCTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </>
  );
}

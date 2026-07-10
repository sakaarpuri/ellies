import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotanicalImage } from "@/components/BotanicalImage";
import { JsonLdScript } from "@/components/JsonLd";
import { getAllPosts, getPostBySlug, getRelatedPosts, renderMarkdown } from "@/lib/wisdom";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
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

  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/education/${post.slug}`,
    type: "article",
    image: post.heroImage,
    imageAlt: post.heroImageAlt,
    publishedTime: post.date,
    modifiedTime: post.lastUpdated,
  });
}

export default async function WisdomArticlePage({ params }: WisdomArticlePageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${site.url}/education/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.lastUpdated,
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
    inLanguage: "en-IN",
    author: {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}${site.logo}`,
      },
    },
    image: {
      "@type": "ImageObject",
      url: absoluteUrl(post.heroImage),
      caption: post.heroImageAlt,
    },
    thumbnailUrl: absoluteUrl(post.heroImage),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/education/${post.slug}`,
    },
    about: ["Ayurveda", "Herbal wellness", post.category],
  };

  return (
    <>
      <article className="article-page">
        <header className="article-hero">
          <div>
            <p className="eyebrow">
              {post.category} · {post.readingTime}
            </p>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <div className="article-meta large">
              <span>
                Updated{" "}
                {new Intl.DateTimeFormat("en", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(post.lastUpdated))}
              </span>
              <span>{post.readingTime}</span>
            </div>
          </div>
          <figure>
            <BotanicalImage src={post.heroImage} alt={post.heroImageAlt} priority />
          </figure>
        </header>

        <div className="reading-sheet">
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
          <aside className="doctor-aside">
            <p className="eyebrow">When to see a doctor</p>
            <p>
              If a concern is persistent, worsening, or you are pregnant, nursing, or taking
              medicines — speak to a qualified doctor before trying anything new.
            </p>
          </aside>
          <section className="related-reading" aria-labelledby="related-reading-title">
            <p className="eyebrow">Related Reading</p>
            <h2 id="related-reading-title">Keep reading.</h2>
            <ul>
              {relatedPosts.map((relatedPost) => (
                <li key={relatedPost.slug}>
                  <Link href={`/education/${relatedPost.slug}`}>
                    <span>{relatedPost.category}</span>
                    {relatedPost.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <Link className="button primary article-cta" href="/#joint-comfort-check-in">
            Ask about your situation
          </Link>
        </div>
      </article>
      <footer className="mini-footer">
        <p>Education, not diagnosis. © 2026 Ellie&apos;s Botanics</p>
      </footer>
      <JsonLdScript
        data={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Herbal Wisdom", path: "/education" },
            { name: post.title, path: `/education/${post.slug}` },
          ]),
        ]}
      />
    </>
  );
}

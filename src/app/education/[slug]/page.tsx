import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotanicalImage } from "@/components/BotanicalImage";
import { ContactCTA } from "@/components/ContactCTA";
import { DisclaimerCallout } from "@/components/DisclaimerCallout";
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
    imageAlt: `Botanical visual for ${post.title}`,
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
    image: absoluteUrl(post.heroImage),
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
            <BotanicalImage src={post.heroImage} alt={`Botanical visual for ${post.title}`} priority />
          </figure>
        </header>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
        <footer className="article-footer-links">
          <section className="article-consultation-note">
            <p className="eyebrow">Personal Context</p>
            <h2>Need guidance for your own concern?</h2>
            <p>
              Herbal education is most useful when it leads to better questions. If you need
              individual guidance, share the relevant details so Ellie&apos;s Botanics can follow up
              for consultation.
            </p>
            <Link className="button secondary" href="/#joint-comfort-check-in">
              Share a consultation concern
            </Link>
          </section>
          <section className="related-reading" aria-labelledby="related-reading-title">
            <p className="eyebrow">Related Reading</p>
            <h2 id="related-reading-title">Continue with Herbal Wisdom.</h2>
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
        </footer>
      </article>
      <DisclaimerCallout />
      <ContactCTA />
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

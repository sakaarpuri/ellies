import Link from "next/link";
import type { CSSProperties } from "react";
import { BotanicalImage } from "@/components/BotanicalImage";
import type { WisdomArticle } from "@/lib/wisdom";

type ArticleCardProps = {
  post: WisdomArticle;
  index?: number;
};

export function ArticleCard({ post, index = 0 }: ArticleCardProps) {
  return (
    <article className="article-card" style={{ "--index": index } as CSSProperties}>
      <Link href={`/education/${post.slug}`} className="article-image-link">
        <BotanicalImage src={post.heroImage} alt={`Botanical visual for ${post.title}`} />
      </Link>
      <div className="article-card-content">
        <div className="article-meta">
          <span>{post.category}</span>
          <span>{post.readingTime}</span>
        </div>
        <h3>
          <Link href={`/education/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.description}</p>
        <Link href={`/education/${post.slug}`} className="text-link">
          Read more
        </Link>
      </div>
    </article>
  );
}

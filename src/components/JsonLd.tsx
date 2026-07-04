import type { JsonLd } from "@/lib/seo";

type JsonLdScriptProps = {
  data: JsonLd | JsonLd[];
};

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

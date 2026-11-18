import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { arohini, arohiniBotanicals, arohiniPackHighlights, arohiniQualityStatement } from "@/lib/products";

export function ArohiniIntroduction({ onHomePage = false }: { onHomePage?: boolean }) {
  return (
    <div className="arohini-introduction">
      <p className="product-introduction">{arohini.description}</p>
      <p className="arohini-formula">Sugar-free. No artificial sweeteners.</p>
      <ul className="arohini-benefits" aria-label="Arohini wellness highlights">
        {arohiniPackHighlights.map((highlight) => <li key={highlight}><strong>{highlight}</strong></li>)}
      </ul>
      <p className="arohini-ingredients">
        <strong>Seven key botanicals</strong>
        {arohiniBotanicals.map(({ name }, index) => {
          const hash = `#ingredient-${name.toLowerCase()}`;
          return (
            <span key={name}>
              {index > 0 ? ", " : ""}
              {onHomePage ? <Link href={`${arohini.path}${hash}`}>{name}</Link> : <a href={hash}>{name}</a>}
            </span>
          );
        })}.
      </p>
      <div className="arohini-quality">
        <ShieldCheck size={24} aria-hidden="true" />
        <p><strong>Quality in every ingredient.</strong>{arohiniQualityStatement}</p>
      </div>
    </div>
  );
}

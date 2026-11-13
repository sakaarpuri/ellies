import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { arohini, arohiniBotanicals, arohiniPackHighlights, arohiniQualityStatement } from "@/lib/products";

export function ArohiniIntroduction() {
  return (
    <div className="arohini-introduction">
      <p className="product-introduction">{arohini.description}</p>
      <p className="arohini-formula">Sugar-free. No artificial sweeteners.</p>
      <ul className="arohini-benefits" aria-label="Arohini wellness highlights">
        {arohiniPackHighlights.map((highlight) => <li key={highlight}><strong>{highlight}</strong></li>)}
      </ul>
      <p className="arohini-ingredients">
        <strong>Seven key botanicals</strong>
        {arohiniBotanicals.map(([name], index) => (
          <span key={name}>{index > 0 ? ", " : ""}<Link href={`/products/arohini#ingredient-${name.toLowerCase()}`}>{name}</Link></span>
        ))}.
      </p>
      <div className="arohini-quality">
        <ShieldCheck size={24} aria-hidden="true" />
        <p><strong>Quality in every ingredient.</strong>{arohiniQualityStatement}</p>
      </div>
    </div>
  );
}

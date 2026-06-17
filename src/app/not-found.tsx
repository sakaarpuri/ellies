import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <p className="eyebrow">Not Found</p>
      <h1>This page is not in the herbarium.</h1>
      <p>The page may have moved, or the link may be incorrect.</p>
      <Link className="button primary" href="/">
        Return home
      </Link>
    </section>
  );
}

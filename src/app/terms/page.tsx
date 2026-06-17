import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Ellie&apos;s Botanics.",
};

export default function TermsPage() {
  return (
    <section className="legal-page">
      <p className="eyebrow">Terms</p>
      <h1>Terms of Use</h1>
      <p>
        By using this website, you agree to read the information as general educational content.
        Ellie&apos;s Botanics may update the site, content, and policies over time.
      </p>
      <h2>Content use</h2>
      <p>
        Site text, layout, and visual presentation belong to Ellie&apos;s Botanics unless otherwise
        noted. Please request permission before reusing original content.
      </p>
      <h2>External references</h2>
      <p>
        Links and references are provided for context. Ellie&apos;s Botanics is not responsible for
        third-party websites.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href="mailto:elliesbotanics@gmail.com">elliesbotanics@gmail.com</a>.
      </p>
    </section>
  );
}

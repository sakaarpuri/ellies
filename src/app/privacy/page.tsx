import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for Ellie's Botanics.",
};

export default function PrivacyPage() {
  return (
    <section className="legal-page">
      <p className="eyebrow">Privacy</p>
      <h1>Privacy Policy</h1>
      <p>
        Ellie&apos;s Botanics keeps privacy simple. If you contact us by email, phone, or a future
        website form, we use the details you provide only to respond to your enquiry, share requested
        information, or maintain a direct relationship with you.
      </p>
      <h2>Information we may receive</h2>
      <p>
        Your name, email address, phone number, message content, and basic website analytics may be
        received when you interact with the site.
      </p>
      <h2>How we use it</h2>
      <p>
        We use information for communication, site improvement, and record keeping. We do not sell
        personal information.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions, write to{" "}
        <a href="mailto:elliesbotanics@gmail.com">elliesbotanics@gmail.com</a>.
      </p>
    </section>
  );
}

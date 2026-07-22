import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Payment Received | Ellie’s Botanics",
    description:
      "Confirmation page for Ellie’s Botanics consultation payment responses from PayU Hosted Checkout.",
    path: "/payment/success",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

type PaymentPageProps = {
  searchParams: Promise<{
    verified?: string;
    txnid?: string;
    status?: string;
  }>;
};

export default async function PaymentSuccessPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const verified = params.verified === "1";

  return (
    <>
      <section className="page-hero payment-page">
        <p className="eyebrow">Consultation Payment</p>
        <h1>Payment response received.</h1>
        <p>
          Thank you. Ellie’s Botanics will review the PayU confirmation and follow up on your
          consultation request.
        </p>
        <div className={verified ? "payment-panel success" : "payment-panel caution"}>
          <strong>{verified ? "Payment response verified" : "Verification pending"}</strong>
          <p>
            {verified
              ? "The payment response signature matched the PayU return data."
              : "The payment response could not be verified on this page. Please keep your PayU confirmation message until our team confirms it."}
          </p>
          {params.txnid ? <small>Transaction reference: {params.txnid}</small> : null}
        </div>
        <Link className="button primary" href="/">
          Return home
        </Link>
      </section>
      <ContactCTA />
    </>
  );
}

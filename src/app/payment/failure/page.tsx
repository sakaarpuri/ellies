import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Payment Not Completed | Ellie’s Botanics",
    description:
      "Payment status page for Ellie’s Botanics consultation payment attempts through PayU Hosted Checkout.",
    path: "/payment/failure",
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

export default async function PaymentFailurePage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;

  return (
    <>
      <section className="page-hero payment-page">
        <p className="eyebrow">Consultation Payment</p>
        <h1>Payment was not completed.</h1>
        <p>
          You can try again from the consultation form, or contact Ellie’s Botanics directly if
          PayU showed a different status.
        </p>
        <div className="payment-panel caution">
          <strong>Status from PayU</strong>
          <p>{params.status || "No completed payment status was returned."}</p>
          {params.txnid ? <small>Transaction reference: {params.txnid}</small> : null}
        </div>
        <Link className="button primary" href="/#joint-comfort-check-in">
          Try again
        </Link>
      </section>
      <ContactCTA />
    </>
  );
}

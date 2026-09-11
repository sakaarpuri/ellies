import type { Metadata } from "next";
import Link from "next/link";
import { ContactCTA } from "@/components/ContactCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Payment Received | Ellie’s Botanics",
    description:
      "Confirmation page for Ellie’s Botanics consultation payment responses from secure checkout.",
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
    recorded?: string;
    confirmation?: string;
    txnid?: string;
    status?: string;
  }>;
};

export default async function PaymentSuccessPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const verified = params.verified === "1";
  const recorded = params.recorded === "1";
  const confirmationSent = params.confirmation === "1";

  return (
    <>
      <section className="page-hero payment-page">
        <p className="eyebrow">Consultation Payment</p>
        <h1>Payment response received.</h1>
        <p>
          Thank you. Ellie’s Botanics will review the booking record and follow up on your
          consultation request.
        </p>
        <div className={verified ? "payment-panel success" : "payment-panel caution"}>
          <strong>{verified ? "Payment response verified" : "Verification pending"}</strong>
          <p>
            {verified
              ? "The payment response signature was verified."
              : "The payment response could not be verified on this page. Please keep your payment confirmation message until our team confirms it."}
          </p>
          {confirmationSent ? (
            <p>
              Your consultation record has been saved. A confirmation email is sent to the email
              address entered with the booking.
            </p>
          ) : recorded ? (
            <p>
              Your consultation record has been saved. Please keep the transaction reference below
              for your records.
            </p>
          ) : (
            <p>
              If the booking record is not visible to our team, Ellie’s Botanics can still trace it
              from the transaction reference below.
            </p>
          )}
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

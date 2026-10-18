import Link from "next/link";
import { getReceipt } from "@/lib/orders";
import { site } from "@/lib/site";

export const metadata = {
  title: "Your payment",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ txnid?: string; token?: string }>;
}) {
  const params = await searchParams;
  let receipt = null;
  try {
    receipt = await getReceipt(params.txnid || "", params.token || "");
  } catch {
    /* Storage outages must not be described as failed payments. */
  }
  return (
    <section className="page-hero payment-page">
      <p className="eyebrow">Ellie&apos;s Botanics</p>
      <h1>
        {receipt?.paid
          ? receipt.type === "product"
            ? "Your order is confirmed."
            : "Your payment is confirmed."
          : "Checking your payment."}
      </h1>
      <p>
        {receipt?.paid
          ? receipt.type === "product"
            ? "Thank you for choosing Arohini. Our team will prepare your order and share delivery updates."
            : "Thank you. Our team will contact you to arrange a consultation time."
          : "We cannot confirm a successful payment on this page yet. If your account was debited, please do not pay again. Keep your payment reference and contact us for help."}
      </p>
      {receipt && (
        <div className="order-receipt">
          <p>
            <strong>Reference:</strong> {receipt.txnid}
          </p>
          <p>
            {receipt.productinfo}
            {receipt.type === "product"
              ? ` · Quantity ${receipt.quantity}`
              : ""}
          </p>
          <p>
            <strong>
              {receipt.paid ? "Paid" : "Order total"}: Rs. {receipt.amount}
            </strong>
          </p>
          {receipt.paid && (
            <p>
              {receipt.emailSent
                ? "A confirmation email has been sent to the address you provided."
                : "Your record is saved. Your email confirmation is pending; please keep this reference."}
            </p>
          )}
        </div>
      )}
      <p>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <Link className="button primary" href="/">
        Return home
      </Link>
    </section>
  );
}

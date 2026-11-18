"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckoutAddress } from "@/components/CheckoutAddress";
import { arohini, arohiniBundle, arohiniBundleMessage, getArohiniPrice } from "@/lib/products";
import { site } from "@/lib/site";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function ProductCheckout() {
  const [quantity, setQuantity] = useState<number>(arohiniBundle.quantity);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { subtotal, discount, total } = getArohiniPrice(quantity);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(data.entries()),
          productId: arohini.id,
          quantity,
          consent: data.get("consent") === "on",
          newsletterOptIn: data.get("newsletterOptIn") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ||
            "Checkout is temporarily unavailable. Please try again.",
        );
      if (!/^https:\/\/(secure|test)\.payu\.in\/_payment$/.test(result.action))
        throw new Error("Checkout is unavailable. Please contact us.");
      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.action;
      form.hidden = true;
      for (const [name, value] of Object.entries(result.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
      setBusy(false);
    }
  }
  return (
    <section className="checkout-layout">
      <div className="checkout-summary">
        <Link className="text-link" href={arohini.path}>
          Back to Arohini
        </Link>
        <h1>Your order</h1>
        <div className="checkout-product">
          <Image
            src={arohini.image}
            width={76}
            height={95}
            alt="Arohini bottle and box"
          />
          <div>
            <h2>Arohini</h2>
            <p>
              Women&apos;s wellness 40+
              <br />
              {arohini.size} · {rupees.format(arohini.price)} per bottle
            </p>
          </div>
        </div>
        <p className="arohini-bundle-note">{arohiniBundleMessage}</p>
        <p className="checkout-course">
          One {arohini.size} bottle covers a regular {arohini.courseDaysPerBottle}-day course when taken as directed on the label.
        </p>
        <label className="quantity-field">
          Quantity{" "}
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={busy}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "bottle" : "bottles"} ({n * arohini.courseDaysPerBottle} days)
              </option>
            ))}
          </select>
        </label>
        <dl className="checkout-totals" aria-live="polite">
          <div>
            <dt>Subtotal</dt>
            <dd>{rupees.format(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="checkout-savings">
              <dt>{arohiniBundle.discountPercent}% bundle discount</dt>
              <dd>−{rupees.format(discount)}</dd>
            </div>
          )}
          <div>
            <dt>Delivery within India</dt>
            <dd>Free</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{rupees.format(total)}</dd>
          </div>
        </dl>
        <p className="product-small">{arohini.deliveryEstimate}</p>
        <p className="product-small">
          For international orders, email{" "}
          <a href={`mailto:${site.email}?subject=International%20Arohini%20order`}>
            {site.email}
          </a>
          .
        </p>
      </div>
      <form className="checkout-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          <legend>Contact details</legend>
          <div className="checkout-fields checkout-contact-fields">
            <label>
              Full name
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
              />
            </label>
            <label>
              Mobile / WhatsApp
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                minLength={10}
                maxLength={20}
              />
            </label>
            <label className="checkout-email">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={100}
              />
            </label>
          </div>
          <section className="checkout-delivery" aria-labelledby="delivery-heading">
            <h2 id="delivery-heading">Delivery address</h2>
            <CheckoutAddress />
          </section>
          <label className="checkout-consent">
            <input type="checkbox" name="consent" required />
            <span>
              I agree to the <Link href="/terms">terms</Link> and{" "}
              <Link href="/privacy">privacy policy</Link>, and to being
              contacted about this order.
            </span>
          </label>
          <label className="checkout-consent">
            <input type="checkbox" name="newsletterOptIn" />
            <span>
              Email me the Ellie&apos;s Botanics newsletter and occasional
              requests for product feedback. (Optional)
            </span>
          </label>
          <p className="checkout-hint">Enter payment details securely on PayU.</p>
          {error && (
            <p role="alert" className="checkout-error">
              {error}
            </p>
          )}
          <button type="submit" className="button primary">
            {busy
              ? "Opening secure checkout..."
              : `Pay ${rupees.format(total)}`}
          </button>
        </fieldset>
      </form>
    </section>
  );
}

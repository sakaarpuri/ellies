"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { arohini } from "@/lib/products";

export function ProductCheckout() {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
            width={112}
            height={140}
            alt="Arohini bottle and box"
          />
          <div>
            <h2>Arohini</h2>
            <p>
              Women&apos;s wellness 40+
              <br />
              200 ml · ₹{arohini.price} per bottle
            </p>
          </div>
        </div>
        <label className="quantity-field">
          Quantity{" "}
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={busy}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <dl className="checkout-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>₹{quantity * arohini.price}</dd>
          </div>
          <div>
            <dt>Delivery within India</dt>
            <dd>Free</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>₹{quantity * arohini.price}</dd>
          </div>
        </dl>
        <p className="product-small">
          Need help?{" "}
          <a href="mailto:support@elliesbotanics.com">
            support@elliesbotanics.com
          </a>
        </p>
      </div>
      <form className="checkout-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          <legend>Contact &amp; delivery</legend>
          <div className="checkout-fields">
            <label className="full">
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
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={100}
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
            <label className="full">
              Delivery address
              <textarea
                name="address"
                autoComplete="street-address"
                required
                minLength={8}
                maxLength={250}
                rows={3}
              />
            </label>
            <label>
              City
              <input
                name="city"
                autoComplete="address-level2"
                required
                minLength={2}
                maxLength={80}
              />
            </label>
            <label>
              State / Union territory
              <input
                name="state"
                autoComplete="address-level1"
                required
                minLength={2}
                maxLength={80}
              />
            </label>
            <label>
              PIN code
              <input
                name="pincode"
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="[1-9][0-9]{5}"
                required
                maxLength={6}
              />
            </label>
            <label>
              Country
              <input value="India" readOnly autoComplete="country-name" />
            </label>
          </div>
          <label className="checkout-consent">
            <input type="checkbox" name="consent" required />
            <span>
              I agree to the <Link href="/terms">terms</Link> and{" "}
              <Link href="/privacy">privacy policy</Link>, and to being
              contacted about this order.
            </span>
          </label>
          <p className="product-small">
            Your payment details are entered on secure checkout, not stored on
            this website.
          </p>
          {error && (
            <p role="alert" className="checkout-error">
              {error}
            </p>
          )}
          <button type="submit" className="button primary">
            {busy
              ? "Opening secure checkout..."
              : `Pay ₹${quantity * arohini.price}`}
          </button>
        </fieldset>
      </form>
    </section>
  );
}

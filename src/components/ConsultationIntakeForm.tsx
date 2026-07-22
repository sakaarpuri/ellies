"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { consultation, site } from "@/lib/site";

type PaymentStatus = {
  kind: "idle" | "loading" | "error";
  message: string;
};

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildWhatsappUrl(formData: FormData) {
  const name = getFormValue(formData, "name") || "Visitor";
  const phone = getFormValue(formData, "phone") || "not shared";
  const email = getFormValue(formData, "email") || "not shared";
  const concernArea = getFormValue(formData, "concernArea") || "not selected";
  const concern = getFormValue(formData, "concern") || "not shared";
  const message = [
    "Hello, I came from Ellie's Botanics.",
    `Name: ${name}`,
    `Phone / WhatsApp: ${phone}`,
    `Email: ${email}`,
    `Where is the discomfort: ${concernArea}`,
    "",
    "Tell us about it:",
    concern,
  ].join("\n");

  return `https://wa.me/${consultation.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function ConsultationIntakeForm() {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    concernArea: "Knees",
    concern: "",
    consent: false,
  });
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    kind: "idle",
    message: "",
  });
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim());
  const canSend = useMemo(
    () =>
      values.name.trim().length > 1 &&
      values.phone.trim().length > 5 &&
      emailIsValid &&
      values.concern.trim().length > 8 &&
      values.consent,
    [emailIsValid, values],
  );

  function updateValue(name: keyof typeof values, value: string | boolean) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handlePayment(form: HTMLFormElement) {
    if (!form.reportValidity() || !canSend) {
      return;
    }

    setPaymentStatus({
      kind: "loading",
      message: "Opening PayU Hosted Checkout...",
    });

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/payu/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: getFormValue(formData, "name"),
          email: getFormValue(formData, "email"),
          phone: getFormValue(formData, "phone"),
          concernArea: getFormValue(formData, "concernArea"),
          consent: values.consent,
        }),
      });
      const payload = (await response.json()) as {
        action?: string;
        fields?: Record<string, string>;
        error?: string;
      };

      if (!response.ok || !payload.action || !payload.fields) {
        throw new Error(payload.error || "Payment could not be started.");
      }

      const checkoutForm = document.createElement("form");
      checkoutForm.method = "POST";
      checkoutForm.action = payload.action;
      checkoutForm.style.display = "none";

      Object.entries(payload.fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        checkoutForm.append(input);
      });

      document.body.append(checkoutForm);
      checkoutForm.submit();
    } catch (error) {
      setPaymentStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Payment could not be started. Please try WhatsApp or email.",
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity() || !canSend) {
      return;
    }

    const formData = new FormData(form);
    const name = getFormValue(formData, "name");
    const subjectName = name || "Visitor";
    const subject = `Consultation request - ${subjectName}`;
    const body = [
      "New consultation request from Ellie’s Botanics website",
      "",
      `Name: ${name}`,
      `Phone / WhatsApp: ${getFormValue(formData, "phone")}`,
      `Email: ${getFormValue(formData, "email")}`,
      `Where is the discomfort: ${getFormValue(formData, "concernArea")}`,
      "",
      "Tell us about it:",
      getFormValue(formData, "concern"),
      "",
      "Consent:",
      "The visitor confirmed this is for consultation follow-up, not emergency care.",
    ].join("\n");

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  function handleWhatsapp(form: HTMLFormElement) {
    if (!form.reportValidity() || !canSend) {
      return;
    }

    const formData = new FormData(form);
    window.open(buildWhatsappUrl(formData), "_blank", "noreferrer");
  }

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <label>
        <span>Name</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={(event) => updateValue("name", event.target.value)}
        />
      </label>

      <label>
        <span>Phone / WhatsApp</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={values.phone}
          onChange={(event) => updateValue("phone", event.target.value)}
        />
      </label>

      <label>
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(event) => updateValue("email", event.target.value)}
        />
      </label>

      <div className="choice-field">
        <p id="concern-area-label" className="form-label">
          Where is the discomfort?
        </p>
        <div className="choice-grid two" role="radiogroup" aria-labelledby="concern-area-label">
          {["Knees", "Hips", "Shoulders", "Other"].map((option) => (
            <label key={option} className="choice-option">
              <input
                name="concernArea"
                type="radio"
                value={option}
                checked={values.concernArea === option}
                onChange={() => updateValue("concernArea", option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <label>
        <span>Tell us about it</span>
        <textarea
          name="concern"
          rows={4}
          placeholder="What do you feel, since when, and what makes it better or worse?"
          required
          value={values.concern}
          onChange={(event) => updateValue("concern", event.target.value)}
        />
      </label>

      <label className="consent-row">
        <input
          name="consent"
          type="checkbox"
          required
          checked={values.consent}
          onChange={(event) => updateValue("consent", event.target.checked)}
        />
        <span>I understand this is for consultation follow-up, not emergency care.</span>
      </label>

      <div className="form-actions">
        <button
          className="button primary"
          type="button"
          disabled={!canSend}
          onClick={(event) => {
            const form = event.currentTarget.form;

            if (form) {
              handleWhatsapp(form);
            }
          }}
        >
          Send on WhatsApp
        </button>
        <button className="button secondary" type="submit" disabled={!canSend}>
          Send by email instead
        </button>
        <button
          className="button tertiary"
          type="button"
          disabled={!canSend || paymentStatus.kind === "loading"}
          onClick={(event) => {
            const form = event.currentTarget.form;

            if (form) {
              handlePayment(form);
            }
          }}
        >
          {paymentStatus.kind === "loading" ? "Opening PayU..." : "Pay consultation fee"}
        </button>
      </div>
      {paymentStatus.message ? (
        <p className={`payment-status ${paymentStatus.kind}`} role="status">
          {paymentStatus.message}
        </p>
      ) : null}
      <p className="form-note">
        PayU opens securely after the form is complete. Nothing is stored on this website.
      </p>
    </form>
  );
}

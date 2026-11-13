"use client";

import type { FormEvent } from "react";
import { useId, useState } from "react";
import { consultation } from "@/lib/site";
import { genderOptions } from "@/lib/consultation-details";

type PaymentStatus = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

type LeadAction = "request_submitted" | "whatsapp_opened" | "email_opened";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildWhatsappUrl(formData: FormData) {
  const name = getFormValue(formData, "name") || "Visitor";
  const phone = getFormValue(formData, "phone") || "not shared";
  const email = getFormValue(formData, "email") || "not shared";
  const age = getFormValue(formData, "age");
  const gender = getFormValue(formData, "gender");
  const concern = getFormValue(formData, "concern") || "not shared";
  const message = [
    "Hello, I came from Ellie's Botanics.",
    `Name: ${name}`,
    `Phone / WhatsApp: ${phone}`,
    `Email: ${email}`,
    ...(age ? [`Age: ${age}`] : []),
    ...(gender ? [`Gender: ${gender}`] : []),
    "",
    "Tell us about your problem:",
    concern,
  ].join("\n");

  return `https://wa.me/${consultation.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function getLeadPayload(formData: FormData, eventType: LeadAction) {
  return {
    eventType,
    name: getFormValue(formData, "name"),
    phone: getFormValue(formData, "phone"),
    email: getFormValue(formData, "email"),
    age: getFormValue(formData, "age"),
    gender: getFormValue(formData, "gender"),
    concern: getFormValue(formData, "concern"),
    consent: formData.get("consent") === "on",
  };
}

async function recordLeadAction(formData: FormData, eventType: LeadAction) {
  const response = await fetch("/api/consultation/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getLeadPayload(formData, eventType)),
    keepalive: true,
  });
  const payload = (await response.json()) as {
    ok?: boolean;
    error?: string;
    customerConfirmationSent?: boolean;
  };

  if (!response.ok || payload.ok !== true) {
    throw new Error(payload.error || "We could not save your request right now.");
  }

  return payload;
}

export function ConsultationIntakeForm() {
  const genderLabelId = useId();
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    concern: "",
    consent: false,
  });
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    kind: "idle",
    message: "",
  });
  function updateValue(name: keyof typeof values, value: string | boolean) {
    if (paymentStatus.kind === "error") {
      setPaymentStatus({ kind: "idle", message: "" });
    }

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    setPaymentStatus({
      kind: "loading",
      message: "Submitting your request...",
    });

    try {
      const result = await recordLeadAction(new FormData(form), "request_submitted");
      setPaymentStatus({
        kind: "success",
        message: result.customerConfirmationSent
          ? "Request received and recorded. Please check your email for confirmation; Ellie’s Botanics will contact you soon."
          : "Request received and recorded. Ellie’s Botanics will contact you soon.",
      });
      form.reset();
      setValues({
        name: "",
        phone: "",
        email: "",
        age: "",
        gender: "",
        concern: "",
        consent: false,
      });
    } catch (error) {
      setPaymentStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not save your request right now. Please use WhatsApp or email.",
      });
    }
  }

  async function handleWhatsapp(form: HTMLFormElement) {
    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const whatsappWindow = window.open("", "_blank", "noreferrer");

    try {
      await recordLeadAction(formData, "whatsapp_opened");
    } catch {
      // WhatsApp remains available as a direct contact fallback if the sheet is unavailable.
    }

    if (whatsappWindow) {
      whatsappWindow.location.href = buildWhatsappUrl(formData);
    } else {
      window.location.href = buildWhatsappUrl(formData);
    }
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
          minLength={2}
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
          minLength={6}
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

      <div className="intake-demographics">
        <label>
          <span>Age</span>
          <input
            name="age"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            step={1}
            required
            value={values.age}
            onChange={(event) => updateValue("age", event.target.value)}
          />
        </label>
        <label>
          <span id={genderLabelId}>Gender</span>
          <select
            name="gender"
            aria-labelledby={genderLabelId}
            required
            value={values.gender}
            onChange={(event) => updateValue("gender", event.target.value)}
          >
            <option value="">Select gender</option>
            {genderOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span>Tell us about your problem</span>
        <textarea
          name="concern"
          rows={4}
          placeholder="What are you experiencing, and when did it start? आपको क्या परेशानी है, और यह कब शुरू हुई?"
          required
          minLength={2}
          maxLength={900}
          value={values.concern}
          onChange={(event) => updateValue("concern", event.target.value)}
        />
      </label>

      <p className="form-note">
        We use these details to respond to your request.{" "}
        <a href="/privacy">Privacy policy</a>
      </p>

      <label className="consent-row">
        <input
          name="consent"
          type="checkbox"
          required
          checked={values.consent}
          onChange={(event) => updateValue("consent", event.target.checked)}
        />
        <span>I understand this is for consultation, not emergency care.</span>
      </label>

      <div className="form-actions">
        <button
          className="button primary pay-button"
          type="submit"
          disabled={paymentStatus.kind === "loading"}
        >
          {paymentStatus.kind === "loading" ? "Submitting..." : "Submit consultation request"}
        </button>
        <button
          className="button secondary"
          type="button"
          disabled={paymentStatus.kind === "loading"}
          onClick={(event) => {
            const form = event.currentTarget.form;

            if (form) {
              handleWhatsapp(form);
            }
          }}
        >
          Send on WhatsApp only
        </button>
      </div>
      {paymentStatus.message ? (
        <p className={`payment-status ${paymentStatus.kind}`} role="status">
          {paymentStatus.message}
        </p>
      ) : null}
      <p className="form-note">
        Consultation is free. No payment is required. Our team will contact you
        to arrange a time after receiving your request.
      </p>
    </form>
  );
}

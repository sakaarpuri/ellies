"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { consultation, site } from "@/lib/site";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildWhatsappUrl(formData: FormData) {
  const name = getFormValue(formData, "name") || "Visitor";
  const phone = getFormValue(formData, "phone") || "not shared";
  const concernArea = getFormValue(formData, "concernArea") || "not selected";
  const concern = getFormValue(formData, "concern") || "not shared";
  const message = [
    "Hello, I came from Ellie's Botanics.",
    `Name: ${name}`,
    `Phone / WhatsApp: ${phone}`,
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
    concernArea: "Knees",
    concern: "",
    consent: false,
  });
  const canSend = useMemo(
    () =>
      values.name.trim().length > 1 &&
      values.phone.trim().length > 5 &&
      values.concern.trim().length > 8 &&
      values.consent,
    [values],
  );

  function updateValue(name: keyof typeof values, value: string | boolean) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
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
      </div>
      <p className="form-note">
        Nothing is stored on this website. You see the full message before it is sent.
      </p>
    </form>
  );
}

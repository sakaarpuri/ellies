"use client";

import type { FormEvent, MouseEvent } from "react";
import { consultation, site } from "@/lib/site";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildWhatsappUrl(formData: FormData) {
  const name = getFormValue(formData, "name") || "Visitor";
  const age = getFormValue(formData, "age") || "not shared";
  const concern = getFormValue(formData, "concern") || "joint comfort concern";
  const duration = getFormValue(formData, "duration") || "not shared";
  const message = [
    "Hello, I came from Ellie's Botanics.",
    `Name: ${name}`,
    `Age: ${age}`,
    `Concern: ${concern}`,
    `Duration: ${duration}`,
    "I would like professional Ayurvedic guidance.",
  ].join("\n");

  return `https://wa.me/${consultation.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function ConsultationIntakeForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = getFormValue(formData, "name");
    const subjectName = name || "Visitor";
    const subject = `Joint comfort consultation request - ${subjectName}`;
    const body = [
      "New consultation request from Ellie’s Botanics website",
      "",
      `Name: ${name}`,
      `Age: ${getFormValue(formData, "age")}`,
      `City: ${getFormValue(formData, "city")}`,
      `Phone / WhatsApp: ${getFormValue(formData, "phone")}`,
      `Email: ${getFormValue(formData, "email")}`,
      `Preferred follow-up: ${getFormValue(formData, "preferredContact")}`,
      "",
      "Joint comfort concern:",
      getFormValue(formData, "concern"),
      "",
      `How long has this been present: ${getFormValue(formData, "duration")}`,
      `Daily movement impact: ${getFormValue(formData, "movement")}`,
      "",
      "Current care, medicines, or known conditions shared by visitor:",
      getFormValue(formData, "currentCare"),
      "",
      "Consent:",
      "The visitor confirmed they understand this is for consultation follow-up and not emergency care.",
    ].join("\n");

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  function handleWhatsapp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;

    if (!form || !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    window.open(buildWhatsappUrl(formData), "_blank", "noreferrer");
  }

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <div className="form-grid two">
        <label>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>Age</span>
          <input name="age" type="number" min="1" max="120" inputMode="numeric" />
        </label>
      </div>
      <div className="form-grid two">
        <label>
          <span>Phone / WhatsApp</span>
          <input name="phone" type="tel" autoComplete="tel" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" />
        </label>
      </div>
      <div className="form-grid two">
        <label>
          <span>City</span>
          <input name="city" type="text" autoComplete="address-level2" />
        </label>
        <label>
          <span>Preferred follow-up</span>
          <select name="preferredContact" defaultValue="WhatsApp">
            <option>WhatsApp</option>
            <option>Phone call</option>
            <option>Email</option>
          </select>
        </label>
      </div>
      <label>
        <span>What joint comfort concern would you like to discuss?</span>
        <textarea
          name="concern"
          rows={5}
          placeholder="Share the area, what you notice, and what you would like guidance on."
          required
        />
      </label>
      <div className="form-grid two">
        <label>
          <span>How long has this been present?</span>
          <input name="duration" type="text" placeholder="For example: 2 weeks, 6 months" />
        </label>
        <label>
          <span>Daily movement impact</span>
          <select name="movement" defaultValue="Mild">
            <option>Mild</option>
            <option>Moderate</option>
            <option>Significant</option>
            <option>Not sure</option>
          </select>
        </label>
      </div>
      <label>
        <span>Current care, medicines, or known conditions</span>
        <textarea
          name="currentCare"
          rows={4}
          placeholder="Include anything the practitioner should know before follow-up."
        />
      </label>
      <label className="consent-row">
        <input name="consent" type="checkbox" required />
        <span>
          I agree to share these details for consultation follow-up. I understand this website does
          not provide emergency care or diagnosis.
        </span>
      </label>
      <div className="form-actions">
        <button className="button primary" type="submit">
          Send by email
        </button>
        <button className="button secondary" type="button" onClick={handleWhatsapp}>
          WhatsApp instead
        </button>
      </div>
      <p className="form-note">
        Submissions are not stored on the website. Your email app will open a prepared message for
        review before sending to {site.email}.
      </p>
    </form>
  );
}

"use client";

import type { FormEvent, MouseEvent } from "react";
import { consultation, site } from "@/lib/site";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildWhatsappUrl(formData: FormData) {
  const name = getFormValue(formData, "name") || "Visitor";
  const age = getFormValue(formData, "age") || "not shared";
  const concernArea = getFormValue(formData, "concernArea") || "not shared";
  const concern = getFormValue(formData, "concern") || "joint comfort concern";
  const duration = getFormValue(formData, "duration") || "not shared";
  const movement = getFormValue(formData, "movement") || "not shared";
  const message = [
    "Hello, I came from Ellie's Botanics.",
    `Name: ${name}`,
    `Age: ${age}`,
    `Area of concern: ${concernArea}`,
    `Concern: ${concern}`,
    `Duration: ${duration}`,
    `Daily movement impact: ${movement}`,
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
      `Area of concern: ${getFormValue(formData, "concernArea")}`,
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
      <fieldset className="form-section">
        <legend>
          <span className="form-step">01</span>
          <span>
            <strong>Your details</strong>
            <small>How should we contact you?</small>
          </span>
        </legend>
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
        <label>
          <span>City</span>
          <input name="city" type="text" autoComplete="address-level2" />
        </label>
      </fieldset>

      <fieldset className="form-section">
        <legend>
          <span className="form-step">02</span>
          <span>
            <strong>Your concern</strong>
            <small>Share the details relevant to consultation.</small>
          </span>
        </legend>
        <div className="form-grid two">
          <label>
            <span>Area of concern</span>
            <select name="concernArea" defaultValue="" required>
              <option value="" disabled>
                Select an area
              </option>
              <option>Knees</option>
              <option>Hips</option>
              <option>Shoulders</option>
              <option>Hands or wrists</option>
              <option>Feet or ankles</option>
              <option>Multiple areas</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            <span>How long has this been present?</span>
            <input name="duration" type="text" placeholder="For example: 2 weeks" required />
          </label>
        </div>
        <label>
          <span>Describe your concern</span>
          <textarea
            name="concern"
            rows={5}
            placeholder="Describe what you notice, when it occurs, and what guidance you are seeking."
            required
          />
        </label>
        <div className="choice-field">
          <p id="movement-label" className="form-label">
            Effect on daily movement
          </p>
          <div className="choice-grid two" role="radiogroup" aria-labelledby="movement-label">
            {[
              "Noticeable",
              "Limits some activities",
              "Limits many activities",
              "Not sure",
            ].map((option, index) => (
              <label key={option} className="choice-option">
                <input
                  name="movement"
                  type="radio"
                  value={option}
                  defaultChecked={index === 0}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        <label>
          <span>Current medicines, care, conditions, or allergies</span>
          <textarea
            name="currentCare"
            rows={4}
            placeholder="Include anything the doctor should know before follow-up."
          />
        </label>
      </fieldset>

      <fieldset className="form-section">
        <legend>
          <span className="form-step">03</span>
          <span>
            <strong>Follow-up</strong>
            <small>Choose how you prefer to be contacted.</small>
          </span>
        </legend>
        <div className="choice-grid three">
          {["WhatsApp", "Phone call", "Email"].map((option, index) => (
            <label key={option} className="choice-option">
              <input
                name="preferredContact"
                type="radio"
                value={option}
                defaultChecked={index === 0}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="consent-row">
        <input name="consent" type="checkbox" required />
        <span>
          I agree to share these details for consultation follow-up. I understand this website does
          not provide emergency care or diagnosis.
        </span>
      </label>
      <div className="form-actions">
        <button className="button primary" type="submit">
          Prepare email
        </button>
        <button className="button secondary" type="button" onClick={handleWhatsapp}>
          Continue on WhatsApp
        </button>
      </div>
      <p className="form-note">
        Your information is not stored on this website. Prepare email opens a draft for your review
        before sending to {site.email}.
      </p>
    </form>
  );
}

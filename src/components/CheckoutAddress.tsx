"use client";

import { useEffect, useRef, useState } from "react";

type Area = { locality: string; city: string; state: string };
type Lookup = { areas: Area[]; unavailable?: boolean };

export function CheckoutAddress() {
  const [pin, setPin] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const cityInput = useRef<HTMLInputElement>(null);
  const stateInput = useRef<HTMLInputElement>(null);
  const localityInput = useRef<HTMLInputElement>(null);
  const suggested = useRef<Partial<Area>>({});
  const validPin = /^[1-9][0-9]{5}$/.test(pin);

  useEffect(() => {
    if (!validPin) return;
    const controller = new AbortController();

    async function findAreas() {
      try {
        const response = await fetch(`/api/postal-localities?pin=${pin}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not look up PIN code");
        const areas: Area[] = await response.json();
        if (controller.signal.aborted) return;
        setLookup({ areas });

        const first = areas[0];
        if (!first) return;
        if (cityInput.current && !cityInput.current.value && areas.every((area) => area.city === first.city)) {
          cityInput.current.value = suggested.current.city = first.city;
        }
        if (stateInput.current && !stateInput.current.value && areas.every((area) => area.state === first.state)) {
          stateInput.current.value = suggested.current.state = first.state;
        }
      } catch {
        if (!controller.signal.aborted) setLookup({ areas: [], unavailable: true });
      }
    }

    void findAreas();
    return () => controller.abort();
  }, [pin, validPin]);

  function changePin(value: string) {
    const nextPin = value.replace(/\D/g, "").slice(0, 6);
    if (nextPin === pin) return;
    for (const [key, input] of [
      ["city", cityInput.current],
      ["state", stateInput.current],
      ["locality", localityInput.current],
    ] as const) {
      if (input && input.value === suggested.current[key]) input.value = "";
    }
    suggested.current = {};
    setLookup(null);
    setPin(nextPin);
  }

  function applyArea(area: Area | undefined) {
    if (!area || !cityInput.current || !stateInput.current || !localityInput.current) return;
    cityInput.current.value = area.city;
    stateInput.current.value = area.state;
    localityInput.current.value = area.locality;
    suggested.current = area;
  }

  const areas = lookup?.areas ?? [];
  const firstArea = areas[0];
  const sharedRegion = firstArea && areas.every(
    ({ city, state }) => city === firstArea.city && state === firstArea.state,
  );

  return (
    <div className="checkout-fields">
      <div className="checkout-pin full">
        <label>
          PIN code
          <input
            name="pincode"
            autoComplete="shipping postal-code"
            inputMode="numeric"
            pattern="[1-9][0-9]{5}"
            maxLength={6}
            required
            value={pin}
            onChange={(event) => changePin(event.target.value)}
            aria-describedby="checkout-pin-help"
          />
        </label>
        <p
          id="checkout-pin-help"
          className={firstArea ? "sr-only" : "checkout-hint checkout-pin-status"}
          role="status"
        >
          {!validPin
            ? "Enter six digits for area suggestions."
            : !lookup
              ? "Finding delivery areas…"
              : lookup.unavailable
                ? "Suggestions are temporarily unavailable. Enter your address below."
                : areas.length === 0
                  ? "No areas found for this PIN code. Enter your address below."
                  : "Delivery area suggestions available."}
        </p>
        {areas.length > 0 && (
          <label>
            Suggested areas
            <select key={pin} defaultValue="" onChange={(event) => applyArea(areas[parseInt(event.target.value, 10)])}>
              <option value="">Choose your area</option>
              {areas.map(({ locality, city, state }, index) => (
                <option key={`${locality}|${city}|${state}`} value={index}>
                  {sharedRegion ? locality : `${locality} · ${city}, ${state}`}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <label className="checkout-street">
        Flat / house number and building
        <input name="address" autoComplete="shipping address-line1" required minLength={3} maxLength={250} />
      </label>
      <label className="checkout-street">
        Street, area or locality (optional)
        <input ref={localityInput} name="addressLine2" autoComplete="shipping address-line2" maxLength={120} />
      </label>
      <label>
        City / town
        <input ref={cityInput} name="city" autoComplete="shipping address-level2" required minLength={2} maxLength={80} />
      </label>
      <label>
        State / Union territory
        <input ref={stateInput} name="state" autoComplete="shipping address-level1" required minLength={2} maxLength={80} />
      </label>
      <details className="checkout-landmark full">
        <summary>Add landmark</summary>
        <label>
          Nearby landmark (optional)
          <input name="landmark" maxLength={100} />
        </label>
      </details>
    </div>
  );
}

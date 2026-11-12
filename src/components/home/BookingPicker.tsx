'use client';

import { useState } from 'react';
import { waLink } from '@/lib/whatsapp';

interface Props {
  title: string;
  buttonLabel: string;
  places: string[];
  treatments: string[];
  messageTemplate: string;
  whatsapp: string;
}

/** A compact booking bar. The visitor picks a treatment and a place, and WhatsApp opens with the message filled in. */
export default function BookingPicker({ title, buttonLabel, places, treatments, messageTemplate, whatsapp }: Props) {
  const [place, setPlace] = useState(places[0] ?? '');
  const [treatment, setTreatment] = useState(treatments[0] ?? '');

  const message = messageTemplate
    .split('{treatment}')
    .join(treatment || 'massage')
    .split('{place}')
    .join(place || 'to be agreed');

  return (
    <form className="picker" onSubmit={(e) => e.preventDefault()} aria-labelledby="picker-title">
      <h2 id="picker-title" className="picker__title">
        {title}
      </h2>
      <div className="picker__row">
        {treatments.length > 0 && (
          <label className="picker__field">
            <span>Treatment</span>
            <select value={treatment} onChange={(e) => setTreatment(e.target.value)}>
              {treatments.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}
        {places.length > 0 && (
          <label className="picker__field">
            <span>Where</span>
            <select value={place} onChange={(e) => setPlace(e.target.value)}>
              {places.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        )}
        <a href={waLink(whatsapp, message)} className="btn btn--solid picker__go" target="_blank" rel="noopener noreferrer">
          {buttonLabel}
        </a>
      </div>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { buildBookingMessage, EMPTY_BOOKING, type BookingForm } from '@/lib/booking';
import { waLink } from '@/lib/whatsapp';

interface Props {
  whatsapp: string;
  treatments: string[];
  places: string[];
  title: string;
  text: string;
  buttonLabel: string;
  notePlaceholder: string;
}

/**
 * Nothing is stored or sent to a server. The form builds a WhatsApp message and opens
 * WhatsApp so the visitor can read it and press send themselves.
 */
export default function ContactForm({ whatsapp, treatments, places, title, text, buttonLabel, notePlaceholder }: Props) {
  const [f, setF] = useState<BookingForm>({ ...EMPTY_BOOKING, treatment: treatments[0] ?? '', place: places[0] ?? '' });
  const [today, setToday] = useState('');
  useEffect(() => {
    const d = new Date();
    setToday(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }, []);

  const set = (k: keyof BookingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const message = buildBookingMessage(f);
  const href = waLink(whatsapp, message);

  return (
    <form
      className="form glass"
      aria-labelledby="form-title"
      onSubmit={(e) => {
        e.preventDefault();
        window.open(href, '_blank', 'noopener,noreferrer');
      }}
    >
      <h2 id="form-title" className="form__title">
        {title}
      </h2>
      {text && <p className="form__text">{text}</p>}

      <div className="form__grid">
        <label className="fld">
          <span>Your name</span>
          <input type="text" name="name" value={f.name} onChange={set('name')} autoComplete="name" maxLength={80} />
        </label>
        <label className="fld">
          <span>Phone number</span>
          <input type="tel" name="phone" value={f.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" maxLength={30} />
        </label>

        {treatments.length > 0 && (
          <label className="fld">
            <span>Treatment</span>
            <select name="treatment" value={f.treatment} onChange={set('treatment')}>
              <option value="">Not sure yet</option>
              {treatments.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}
        {places.length > 0 && (
          <label className="fld">
            <span>Where</span>
            <select name="place" value={f.place} onChange={set('place')}>
              {places.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="fld fld--wide">
          <span>Area or hotel in Kigali</span>
          <input type="text" name="area" value={f.area} onChange={set('area')} maxLength={120} />
        </label>
        <label className="fld">
          <span>Preferred date</span>
          <input type="date" name="date" value={f.date} onChange={set('date')} min={today || undefined} />
        </label>
        <label className="fld">
          <span>Preferred time</span>
          <input type="time" name="time" value={f.time} onChange={set('time')} />
        </label>
        <label className="fld fld--wide">
          <span>Anything else</span>
          <textarea name="notes" rows={3} value={f.notes} onChange={set('notes')} placeholder={notePlaceholder} maxLength={600} />
        </label>
      </div>

      <div className="form__foot">
        <button type="submit" className="btn btn--solid btn--lg">
          {buttonLabel}
        </button>
        <p className="form__hint">Opens WhatsApp with this message ready. Nothing is sent until you press send there.</p>
      </div>

      <details className="form__preview">
        <summary>See the message</summary>
        <pre aria-live="polite">{message}</pre>
      </details>
    </form>
  );
}

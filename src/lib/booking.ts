/** Turns the Contact page form into a WhatsApp message. Nothing here is sent anywhere by itself. */

export interface BookingForm {
  name: string;
  phone: string;
  treatment: string;
  place: string;
  area: string;
  date: string;
  time: string;
  notes: string;
}

export const EMPTY_BOOKING: BookingForm = { name: '', phone: '', treatment: '', place: '', area: '', date: '', time: '', notes: '' };

const clean = (v: string, max: number) =>
  v
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

const validTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

export function buildBookingMessage(f: BookingForm): string {
  const treatment = clean(f.treatment, 80);
  const place = clean(f.place, 60);
  const area = clean(f.area, 120);
  const date = formatDate(f.date.trim());
  const time = validTime(f.time.trim()) ? f.time.trim() : '';
  const name = clean(f.name, 80);
  const phone = clean(f.phone, 30);
  const notes = clean(f.notes, 600);

  const lines = [treatment ? `Hello, I'd like to book the ${treatment}.` : "Hello, I'd like to book a massage."];
  if (place) lines.push(`Place: ${place}`);
  if (area) lines.push(`Area: ${area}`);
  if (date || time) lines.push(`When: ${[date, time && `at ${time}`].filter(Boolean).join(' ')}`);
  if (name) lines.push(`Name: ${name}`);
  if (phone) lines.push(`Phone: ${phone}`);
  if (notes) lines.push(`Notes: ${notes}`);
  return lines.join('\n');
}

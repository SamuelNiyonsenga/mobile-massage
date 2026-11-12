/** Builds a wa.me link from a number in international format (digits only are kept). */
export function waLink(number: string, text?: string): string {
  const digits = number.replace(/\D/g, '');
  if (!digits) return '/contact';
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${q}`;
}

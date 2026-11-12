import type { IconName } from '@/lib/cms/defaults';

/** Line icons in the style of the flyer: thin gold strokes, designed on a 40 x 40 grid. */
export default function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

const paths: Record<IconName, React.ReactNode> = {
  lotus: (
    <>
      <path d="M20 8c-5 6-5 12 0 18 5-6 5-12 0-18Z" />
      <path d="M20 26c-7-1-12-6-12-12 6 0 10 4 12 12Z" />
      <path d="M20 26c7-1 12-6 12-12-6 0-10 4-12 12Z" />
      <path d="M11 31h18" />
    </>
  ),
  torso: (
    <>
      <circle cx="20" cy="10" r="4" />
      <path d="M9 33c0-9 4-13 11-13s11 4 11 13" />
      <path d="M14 24c2 2 10 2 12 0" />
    </>
  ),
  back: (
    <>
      <circle cx="20" cy="10" r="4" />
      <path d="M10 33c0-9 3-13 10-13s10 4 10 13" />
      <path d="M20 20v13M16 25h8M16 29h8" />
    </>
  ),
  body: (
    <>
      <circle cx="20" cy="8" r="3.5" />
      <path d="M13 16c4 1.5 10 1.5 14 0M20 14v10M16 35l4-11 4 11" />
    </>
  ),
  stones: (
    <>
      <ellipse cx="20" cy="29" rx="11" ry="4.5" />
      <ellipse cx="20" cy="21" rx="8" ry="3.8" />
      <ellipse cx="20" cy="14" rx="5" ry="3" />
    </>
  ),
  home: (
    <>
      <path d="M7 20 20 9l13 11" />
      <path d="M10 18v15h20V18" />
      <path d="M17 33v-8h6v8" />
    </>
  ),
  hotel: (
    <>
      <path d="M11 33V8h18v25" />
      <path d="M16 14h2M22 14h2M16 19h2M22 19h2M16 24h2M22 24h2" />
      <path d="M17 33v-5h6v5M8 33h24" />
    </>
  ),
  pin: (
    <>
      <path d="M20 35C13 26 11 21 11 17a9 9 0 0 1 18 0c0 4-2 9-9 18Z" />
      <circle cx="20" cy="17" r="3.2" />
    </>
  ),
};

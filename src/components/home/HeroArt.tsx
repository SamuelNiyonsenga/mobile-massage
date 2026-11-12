/** Fallback illustration for the hero arch, used when no photo is set in the CMS. */
export default function HeroArt() {
  return (
    <svg
      viewBox="0 0 400 540"
      preserveAspectRatio="xMidYMid slice"
      className="hero__svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b0f08" />
          <stop offset="1" stopColor="#5a2a1c" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="50%" cy="100%" r="75%">
          <stop offset="0" stopColor="#f3d58f" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#c99a4a" stopOpacity="0.4" />
          <stop offset="1" stopColor="#c99a4a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="540" fill="url(#hero-bg)" />
      <g className="hero__glow">
        <rect width="400" height="540" fill="url(#hero-glow)" />
      </g>
      <ellipse cx="200" cy="486" rx="70" ry="19" fill="#2a1812" />
      <ellipse cx="204" cy="463" rx="50" ry="15" fill="#3e1a10" />
      <ellipse cx="199" cy="445" rx="32" ry="12" fill="#2a1812" />
      <ellipse cx="201" cy="431" rx="17" ry="8" fill="#3e1a10" />
    </svg>
  );
}

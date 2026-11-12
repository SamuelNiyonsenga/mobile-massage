'use client';

import { useEffect, useRef, useState } from 'react';

/** A small arch in the corner that fills as you read, with the minutes left. */
export default function ReadingProgress({ targetId, minutes }: { targetId: string; minutes: number }) {
  const path = useRef<SVGPathElement>(null);
  const [left, setLeft] = useState(minutes);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(1, Math.max(0, total > 0 ? -rect.top / total : 0));
      if (path.current) path.current.style.strokeDashoffset = String(1 - done);
      setLeft(Math.max(0, Math.ceil(minutes * (1 - done))));
      setShow(rect.top < window.innerHeight * 0.3 && rect.bottom > 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId, minutes]);

  return (
    <div className={`rp${show ? ' is-on' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 48 60" width="48" height="60" focusable="false">
        <path className="rp__track" d="M5 58V24a19 19 0 0 1 38 0v34" pathLength={1} />
        <path ref={path} className="rp__bar" d="M5 58V24a19 19 0 0 1 38 0v34" pathLength={1} style={{ strokeDashoffset: 1 }} />
      </svg>
      <span className="rp__n">{left === 0 ? '✓' : `${left}m`}</span>
    </div>
  );
}

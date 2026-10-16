import { useEffect, useState } from 'react';

const split = (s) => (typeof Intl !== 'undefined' && Intl.Segmenter ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s), (x) => x.segment) : Array.from(s));

// Types the text letter by letter, holds, erases, and repeats. Grapheme-safe, so Bangla conjuncts never break mid-type.
export default function Typewriter({ text = '', speed = 55, erase = 25, hold = 2800, pause = 500, className = '' }) {
  const chars = split(text); const n = chars.length;
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [i, setI] = useState(0); const [dir, setDir] = useState(1);
  useEffect(() => { setI(0); setDir(1); }, [text]);
  useEffect(() => {
    if (still || !n) return;
    let id;
    if (dir === 1) id = i < n ? setTimeout(() => setI(i + 1), speed) : setTimeout(() => setDir(-1), hold);
    else id = i > 0 ? setTimeout(() => setI(i - 1), erase) : setTimeout(() => setDir(1), pause);
    return () => clearTimeout(id);
  }, [i, dir, n, still, speed, erase, hold, pause]);
  if (!n) return null;
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{still ? text : chars.slice(0, i).join('')}</span>
      {!still && <span aria-hidden="true" className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] animate-pulse bg-brand-500" />}
    </span>
  );
}

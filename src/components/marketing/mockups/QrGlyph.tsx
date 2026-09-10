import { cn } from "@/lib/cn";

/** Deterministic PRNG so server and client render the same QR pattern. */
function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MODULES = 25;
const patternCache = new Map<string, boolean[]>();

function buildPattern(seed: string) {
  const cached = patternCache.get(seed);
  if (cached) return cached;

  const random = mulberry32(hashSeed(seed));
  const cells = new Array<boolean>(MODULES * MODULES).fill(false);

  const isFinder = (x: number, y: number) => {
    const corners = [
      [0, 0],
      [MODULES - 7, 0],
      [0, MODULES - 7],
    ];
    return corners.some(
      ([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7,
    );
  };

  for (let y = 0; y < MODULES; y += 1) {
    for (let x = 0; x < MODULES; x += 1) {
      if (isFinder(x, y)) continue;
      cells[y * MODULES + x] = random() > 0.52;
    }
  }

  patternCache.set(seed, cells);
  return cells;
}

export interface QrGlyphProps {
  /** Changing the seed produces a different (but stable) code. */
  seed?: string;
  className?: string;
  title?: string;
}

/**
 * Decorative QR-style graphic used by the capture mocks. It is not a real,
 * scannable code — the live code is generated at runtime by `qrcode.react`
 * inside the session page.
 */
export function QrGlyph({ seed = "track-attend", className, title }: QrGlyphProps) {
  const cells = buildPattern(seed);
  const finders: Array<[number, number]> = [
    [0, 0],
    [MODULES - 7, 0],
    [0, MODULES - 7],
  ];

  return (
    <svg
      viewBox="-1 -1 27 27"
      className={cn("block h-full w-full", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="-1" y="-1" width="27" height="27" rx="2.4" fill="#ffffff" />
      {cells.map((filled, index) =>
        filled ? (
          <rect
            key={index}
            x={index % MODULES}
            y={Math.floor(index / MODULES)}
            width="1"
            height="1"
            rx="0.22"
            fill="#0f172a"
          />
        ) : null,
      )}
      {finders.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect x={fx} y={fy} width="7" height="7" rx="1.4" fill="#0f172a" />
          <rect x={fx + 1} y={fy + 1} width="5" height="5" rx="1" fill="#ffffff" />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" rx="0.7" fill="#0f172a" />
        </g>
      ))}
    </svg>
  );
}

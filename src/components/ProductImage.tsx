/**
 * Product visual.
 *
 * Renders the ingested photograph when one exists, and otherwise draws a
 * deterministic line-art glyph chosen from the product's category. The two
 * paths are interchangeable, so running the image ingestion later lights the
 * whole catalogue up without a single component change.
 */

import Image from "next/image";

type Props = {
  name: string;
  category?: string;
  src?: string | null;
  className?: string;
  /** Larger glyph stroke + detail for hero/PDP use. */
  detail?: boolean;
  /** Skip lazy-loading and request a high priority fetch — the PDP hero image. */
  priority?: boolean;
  /** Passed straight to next/image; defaults suit a small card thumbnail. */
  sizes?: string;
};

type Glyph = (typeof GLYPHS)[keyof typeof GLYPHS];

/* Each glyph is drawn inside a 0 0 120 120 box, stroke-based, currentColor. */
const GLYPHS = {
  bulb: (
    <>
      <path d="M60 22a24 24 0 0 0-14 43.4V76h28V65.4A24 24 0 0 0 60 22Z" />
      <path d="M48 84h24M50 92h20M53 100h14" />
      <path d="M60 38v20M52 46h16" />
    </>
  ),
  batten: (
    <>
      <rect x="16" y="50" width="88" height="20" rx="6" />
      <path d="M28 50v20M44 50v20M60 50v20M76 50v20M92 50v20" />
      <path d="M24 38h72" />
    </>
  ),
  panel: (
    <>
      <rect x="22" y="34" width="76" height="52" rx="6" />
      <rect x="32" y="44" width="56" height="32" rx="3" />
      <path d="M60 26v-8M34 30l-5-6M86 30l5-6" />
    </>
  ),
  spot: (
    <>
      <circle cx="60" cy="52" r="22" />
      <circle cx="60" cy="52" r="11" />
      <path d="M40 84l-8 14M60 82v16M80 84l8 14" />
    </>
  ),
  street: (
    <>
      <path d="M34 100V34c0-6 5-10 11-10h20" />
      <rect x="62" y="26" width="38" height="14" rx="5" />
      <path d="M66 44l-8 16M80 44v18M94 44l8 16" />
    </>
  ),
  flood: (
    <>
      <rect x="26" y="30" width="54" height="38" rx="5" />
      <path d="M36 40h34M36 50h34M36 58h20" />
      <path d="M53 68v18M40 96h26" />
      <path d="M86 40l14-8M86 52h16M86 64l14 8" />
    </>
  ),
  strip: (
    <>
      <path d="M14 62c14-16 28 16 42 0s28 16 42 0" />
      <circle cx="28" cy="56" r="3" />
      <circle cx="56" cy="62" r="3" />
      <circle cx="84" cy="56" r="3" />
      <path d="M14 84h92" />
    </>
  ),
  ceilingFan: (
    <>
      <path d="M60 14v18" />
      <circle cx="60" cy="46" r="10" />
      <path d="M52 42 20 28c-5-2-9 4-5 8l30 16" />
      <path d="M68 42l32-14c5-2 9 4 5 8L75 50" />
      <path d="M60 56v34c0 6-8 6-8 0" />
      <path d="M60 56c-8 14-2 30 8 34" />
    </>
  ),
  pedestalFan: (
    <>
      <circle cx="60" cy="44" r="26" />
      <circle cx="60" cy="44" r="7" />
      <path d="M60 37c-10-8-22-2-20 8M67 44c8 10 2 22-8 20M53 44c-8-10-2-22 8-20" />
      <path d="M60 70v22M42 104h36M50 92h20" />
    </>
  ),
  exhaust: (
    <>
      <rect x="22" y="22" width="76" height="76" rx="8" />
      <circle cx="60" cy="60" r="24" />
      <path d="M60 60c-12-6-16-18-6-24M60 60c12 6 16 18 6 24M60 60c6-12 18-16 24-6M60 60c-6 12-18 16-24 6" />
    </>
  ),
  wire: (
    <>
      <circle cx="60" cy="60" r="34" />
      <circle cx="60" cy="60" r="13" />
      <path d="M60 26v13M60 81v13M26 60h13M81 60h13" />
      <path d="M94 44c8-6 14 4 8 10" />
    </>
  ),
  cable: (
    <>
      <circle cx="60" cy="60" r="30" />
      <circle cx="60" cy="47" r="9" />
      <circle cx="49" cy="70" r="9" />
      <circle cx="71" cy="70" r="9" />
    </>
  ),
  mcb: (
    <>
      <rect x="40" y="20" width="40" height="80" rx="5" />
      <rect x="50" y="34" width="20" height="26" rx="3" />
      <path d="M48 72h24M48 82h24" />
      <path d="M40 30h-8M40 90h-8M80 30h8M80 90h8" />
    </>
  ),
  db: (
    <>
      <rect x="18" y="26" width="84" height="68" rx="7" />
      <path d="M18 44h84" />
      <rect x="30" y="54" width="10" height="28" rx="2" />
      <rect x="46" y="54" width="10" height="28" rx="2" />
      <rect x="62" y="54" width="10" height="28" rx="2" />
      <rect x="78" y="54" width="10" height="28" rx="2" />
    </>
  ),
  switchPlate: (
    <>
      <rect x="26" y="20" width="68" height="80" rx="8" />
      <rect x="40" y="34" width="40" height="20" rx="4" />
      <circle cx="50" cy="76" r="6" />
      <circle cx="70" cy="76" r="6" />
    </>
  ),
  socket: (
    <>
      <rect x="22" y="34" width="76" height="52" rx="10" />
      <circle cx="45" cy="60" r="12" />
      <path d="M41 56v8M49 56v8" />
      <circle cx="78" cy="52" r="4" />
      <circle cx="78" cy="68" r="4" />
    </>
  ),
  waterHeater: (
    <>
      <rect x="34" y="18" width="52" height="72" rx="24" />
      <path d="M46 34h28" />
      <circle cx="60" cy="62" r="9" />
      <path d="M46 96v10M74 96v10" />
    </>
  ),
  roomHeater: (
    <>
      <rect x="22" y="30" width="76" height="52" rx="8" />
      <path d="M36 42v28M50 42v28M64 42v28M78 42v28" />
      <path d="M34 94h52" />
    </>
  ),
  iron: (
    <>
      <path d="M20 78h74c8 0 14-6 14-14 0-10-10-16-24-16H44c-14 0-24 12-24 30Z" />
      <path d="M38 40c0-8 6-12 14-12h22" />
      <path d="M24 90h70" />
    </>
  ),
  kettle: (
    <>
      <path d="M34 44h44l-6 50H40Z" />
      <path d="M78 52c12 2 14 20 2 24" />
      <path d="M40 34h32l4 10H36Z" />
    </>
  ),
  mixer: (
    <>
      <path d="M40 30h40l-4 34H44Z" />
      <rect x="36" y="64" width="48" height="30" rx="6" />
      <path d="M50 78h20" />
      <path d="M60 20v10" />
    </>
  ),
  cooktop: (
    <>
      <rect x="18" y="34" width="84" height="52" rx="8" />
      <circle cx="52" cy="60" r="18" />
      <circle cx="52" cy="60" r="8" />
      <path d="M84 50v20" />
    </>
  ),
  airFryer: (
    <>
      <rect x="30" y="24" width="60" height="72" rx="12" />
      <rect x="40" y="60" width="40" height="30" rx="6" />
      <circle cx="60" cy="42" r="8" />
    </>
  ),
  inverter: (
    <>
      <rect x="22" y="28" width="76" height="64" rx="8" />
      <path d="M52 44l-12 20h16l-8 16 20-24H52Z" />
      <path d="M30 100h60" />
    </>
  ),
  solar: (
    <>
      <path d="M20 74l14-46h52l14 46Z" />
      <path d="M27 52h66M60 28v46M43 74l6-46M77 74l-6-46" />
      <path d="M60 74v22M44 100h32" />
    </>
  ),
  torch: (
    <>
      <rect x="52" y="40" width="24" height="60" rx="6" />
      <path d="M52 52 30 40v24Z" />
      <path d="M22 40l-10-6M22 52H10M22 64l-10 6" />
    </>
  ),
  racket: (
    <>
      <ellipse cx="58" cy="44" rx="30" ry="26" />
      <path d="M34 34h48M34 44h48M34 54h48M46 20v48M58 18v52M70 20v48" />
      <path d="M58 70v30" />
    </>
  ),
  extension: (
    <>
      <rect x="16" y="46" width="70" height="28" rx="8" />
      <circle cx="34" cy="60" r="6" />
      <circle cx="54" cy="60" r="6" />
      <circle cx="72" cy="60" r="6" />
      <path d="M86 60h10c6 0 8 6 8 12" />
    </>
  ),
  smart: (
    <>
      <circle cx="60" cy="60" r="14" />
      <path d="M38 38a31 31 0 0 0 0 44M82 38a31 31 0 0 1 0 44" />
      <path d="M26 26a48 48 0 0 0 0 68M94 26a48 48 0 0 1 0 68" />
    </>
  ),
  generic: (
    <>
      <rect x="26" y="26" width="68" height="68" rx="10" />
      <path d="M26 52h68M52 26v68" />
    </>
  ),
} as const;

/** Ordered rules — first match wins, so put the specific words above the broad. */
const RULES: [RegExp, Glyph][] = [
  [/mosquito|racket|zapper/i, GLYPHS.racket],
  [/extension|multi ?plug|plug ?top/i, GLYPHS.extension],
  [/torch|emergency light/i, GLYPHS.torch],
  [/smart|prizm|iot|wi-?fi/i, GLYPHS.smart],
  [/solar|grid-?tie/i, GLYPHS.solar],
  [/inverter/i, GLYPHS.inverter],
  [/air ?fryer/i, GLYPHS.airFryer],
  [/mixer|grinder|blender/i, GLYPHS.mixer],
  [/kettle/i, GLYPHS.kettle],
  [/cooktop|induction|infrared|cooking|gas stove/i, GLYPHS.cooktop],
  [/iron|garment/i, GLYPHS.iron],
  [/room heater|halogen heater|immersion|heating appliance/i, GLYPHS.roomHeater],
  [/water heater|geyser/i, GLYPHS.waterHeater],
  [/exhaust|ventilat/i, GLYPHS.exhaust],
  [/ceiling fan|bldc|decorative ceiling|standard ceiling|premium ceiling/i, GLYPHS.ceilingFan],
  [/pedestal|table fan|wall fan|air circulator|farrata|personal fan/i, GLYPHS.pedestalFan],
  [/\bfan\b/i, GLYPHS.ceilingFan],
  [/distribution board|enclosure|\bdb\b/i, GLYPHS.db],
  [/mcb|rccb|rcbo|isolator|changeover|accl|switchgear/i, GLYPHS.mcb],
  [/socket|accessor/i, GLYPHS.socket],
  [/levana|etira|switch|modular box|plate/i, GLYPHS.switchPlate],
  [/rope|strip light/i, GLYPHS.strip],
  [/flood|bay ?light|highbay|well glass|canopy|industrial/i, GLYPHS.flood],
  [/street|post top|bollard|spike|landscape|outdoor/i, GLYPHS.street],
  [/cob|spot|track/i, GLYPHS.spot],
  [/panel|downlight|flatpanel|recess|surface/i, GLYPHS.panel],
  [/batten|tube ?light|linear|\bt5\b|\bt8\b/i, GLYPHS.batten],
  [/bulb|lamp|\bgls\b|\bcfl\b|\bhid\b|\bmr16\b|\bgu10\b/i, GLYPHS.bulb],
  [/lv power|mv power|ehv|control cable|instrumentation|communication|\bcable\b/i, GLYPHS.cable],
  [/wire|greenwire|optima|primma|suprema|maxima/i, GLYPHS.wire],
  [/light|luminaire|glow|deco/i, GLYPHS.bulb],
];

function pickGlyph(text: string): Glyph {
  for (const [re, g] of RULES) if (re.test(text)) return g;
  return GLYPHS.generic;
}

/** Small deterministic hash so each product gets a stable backdrop angle. */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function ProductImage({
  name,
  category = "",
  src,
  className = "",
  detail = false,
  priority = false,
  sizes = "(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw",
}: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={`object-contain ${className}`}
      />
    );
  }

  const glyph = pickGlyph(`${category} ${name}`);
  const h = hash(name);
  const tilt = (h % 7) - 3;
  const gid = `pg${h % 9973}`;

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={`${name} — illustration placeholder`}
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbfcfd" />
            <stop offset="55%" stopColor="#f1f4f7" />
            <stop offset="100%" stopColor="#e8eef3" />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill={`url(#${gid})`} />
        <circle
          cx={22 + (h % 40)}
          cy={104 - (h % 26)}
          r={34 + (h % 14)}
          fill="#ffffff"
          opacity="0.55"
        />
      </svg>

      <svg
        viewBox="0 0 120 120"
        className="relative h-[62%] w-[62%] text-ink-3"
        style={{ transform: `rotate(${tilt * 0.4}deg)` }}
        fill="none"
        stroke="currentColor"
        strokeWidth={detail ? 2.1 : 2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={detail ? 0.5 : 0.42}
        aria-hidden="true"
      >
        {glyph}
      </svg>
    </div>
  );
}

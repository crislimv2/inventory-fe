import { cn } from "@/lib/utils";

export type UnitShape =
  | "bottle"
  | "single"
  | "sachet"
  | "pack"
  | "box"
  | "carton"
  | "sack"
  | "dozen";

/** Map a free-text unit name (Indonesian retail) to an illustration shape. */
export function classifyUnit(unitName: string): UnitShape {
  const n = unitName.toLowerCase();
  if (n.includes("sachet") || n.includes("saset")) return "sachet";
  if (n.includes("renteng")) return "pack";
  if (n.includes("lusin") || n.includes("dozen")) return "dozen";
  if (n.includes("dus") || n.includes("karton")) return "carton";
  if (n.includes("box")) return "box";
  if (n.includes("pack") || n.includes("pak")) return "pack";
  if (
    n.includes("kg") ||
    n.includes("gram") ||
    n.includes("gr") ||
    n.includes("kilo") ||
    n.includes("ons")
  )
    return "sack";
  if (n.includes("botol") || n.includes("kaleng") || n.includes("liter"))
    return "bottle";
  return "single";
}

const FLOOR = (
  <ellipse cx="100" cy="174" rx="56" ry="9" fill="currentColor" fillOpacity="0.07" />
);

const SHAPES: Record<UnitShape, React.ReactNode> = {
  bottle: (
    <>
      {FLOOR}
      <rect x="88" y="26" width="24" height="14" rx="3" fill="currentColor" fillOpacity="0.9" />
      <rect x="92" y="39" width="16" height="16" fill="currentColor" fillOpacity="0.9" />
      <rect
        x="70"
        y="54"
        width="60"
        height="108"
        rx="16"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="5"
      />
      <rect x="70" y="100" width="60" height="36" fill="currentColor" fillOpacity="0.9" />
      <rect x="80" y="66" width="8" height="26" rx="4" fill="currentColor" fillOpacity="0.28" />
    </>
  ),
  single: (
    <>
      {FLOOR}
      <path d="M70 64 L100 42 L130 64 Z" fill="currentColor" fillOpacity="0.9" />
      <path d="M100 42 V64" stroke="currentColor" strokeWidth="3" strokeOpacity="0.35" />
      <rect
        x="70"
        y="64"
        width="60"
        height="98"
        rx="6"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="5"
      />
      <rect x="70" y="104" width="60" height="34" fill="currentColor" fillOpacity="0.9" />
    </>
  ),
  sachet: (
    <>
      {FLOOR}
      <rect x="56" y="46" width="88" height="12" rx="3" fill="currentColor" fillOpacity="0.9" />
      <path
        d="M68 46 V58 M84 46 V58 M100 46 V58 M116 46 V58 M132 46 V58"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.3"
      />
      <rect
        x="62"
        y="58"
        width="76"
        height="96"
        rx="8"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="5"
      />
      <rect x="62" y="92" width="76" height="32" fill="currentColor" fillOpacity="0.9" />
      <path d="M138 62 L128 72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  pack: (
    <>
      {FLOOR}
      <path
        d="M82 74 Q100 52 118 74"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect
        x="48"
        y="74"
        width="104"
        height="76"
        rx="14"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M82 74 V150 M118 74 V150"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.35"
      />
      <rect x="48" y="100" width="104" height="24" fill="currentColor" fillOpacity="0.9" />
    </>
  ),
  box: (
    <>
      {FLOOR}
      <path d="M100 48 L148 74 L100 100 L52 74 Z" fill="currentColor" fillOpacity="0.9" />
      <path d="M52 74 L100 100 V156 L52 130 Z" fill="currentColor" fillOpacity="0.16" />
      <path d="M148 74 L100 100 V156 L148 130 Z" fill="currentColor" fillOpacity="0.32" />
      <path
        d="M100 100 V156"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
    </>
  ),
  carton: (
    <>
      {FLOOR}
      <path d="M52 86 L100 112 V168 L52 142 Z" fill="currentColor" fillOpacity="0.16" />
      <path d="M148 86 L100 112 V168 L148 142 Z" fill="currentColor" fillOpacity="0.32" />
      <path
        d="M100 60 L148 86 L100 112 L52 86 Z"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M52 86 L100 60 V30 L52 56 Z" fill="currentColor" fillOpacity="0.9" />
      <path d="M148 86 L100 60 V30 L148 56 Z" fill="currentColor" fillOpacity="0.62" />
    </>
  ),
  sack: (
    <>
      {FLOOR}
      <path d="M84 48 Q100 36 116 48 L112 62 H88 Z" fill="currentColor" fillOpacity="0.9" />
      <rect x="84" y="60" width="32" height="11" rx="5.5" fill="currentColor" fillOpacity="0.5" />
      <path
        d="M72 72 Q60 104 66 132 Q70 156 100 156 Q130 156 134 132 Q140 104 128 72 Z"
        fill="currentColor"
        fillOpacity="0.13"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <rect x="84" y="104" width="32" height="26" rx="6" fill="currentColor" fillOpacity="0.9" />
    </>
  ),
  dozen: (
    <>
      {FLOOR}
      <rect
        x="46"
        y="56"
        width="108"
        height="92"
        rx="12"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="5"
      />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={56 + col * 23}
            y={66 + row * 24}
            width="19"
            height="19"
            rx="4"
            fill="currentColor"
            fillOpacity="0.85"
          />
        )),
      )}
    </>
  ),
};

type Props = {
  unitName: string;
  className?: string;
};

export function UnitArtwork({ unitName, className }: Props) {
  const shape = classifyUnit(unitName);
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full text-foreground", className)}
      role="img"
      aria-label={`Ilustrasi satuan ${unitName}`}
      fill="none"
    >
      {SHAPES[shape]}
    </svg>
  );
}

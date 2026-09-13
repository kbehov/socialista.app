/**
 * Hand-drawn doodle accents for the landing hero.
 * Thick marker-style scribbles — same family as the reference swirl.
 */

type DoodleProps = { className?: string };

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Double-loop scribble — vectorized from the reference doodle. */
const SWIRL_PATH =
  "M0 1747 c0 -11 13 -18 48 -22 236 -31 387 -92 578 -236 83 -62 211 -188 234 -230 8 -14 -5 -17 -108 -22 -263 -15 -482 -112 -557 -248 -26 -46 -30 -64 -30 -129 0 -64 4 -82 27 -121 34 -57 87 -105 147 -132 58 -26 218 -35 300 -17 140 30 281 130 331 235 43 90 37 241 -12 339 l-20 39 39 -7 c180 -32 279 -78 404 -188 59 -51 149 -155 149 -171 0 -3 -16 -11 -35 -17 -59 -19 -183 -107 -253 -179 -158 -160 -211 -340 -138 -465 33 -57 75 -92 161 -132 142 -68 256 -54 351 41 62 61 89 111 110 202 31 133 -9 325 -100 476 l-34 55 63 11 c221 39 448 -32 694 -218 52 -39 71 -44 71 -18 -1 12 -52 53 -149 117 -198 131 -427 190 -611 157 l-85 -15 -29 36 c-54 68 -184 190 -240 226 -94 60 -213 102 -346 121 -40 6 -49 13 -85 62 -22 31 -75 88 -118 129 -204 192 -448 310 -679 330 -67 6 -78 5 -78 -9z m888 -547 c18 0 60 -102 72 -173 22 -137 -27 -240 -155 -326 -181 -122 -444 -116 -549 13 -44 53 -56 85 -56 149 1 149 144 264 395 317 67 15 229 29 260 24 11 -2 26 -4 33 -4z m728 -506 c77 -155 102 -301 70 -419 -51 -192 -210 -280 -379 -211 -86 36 -135 74 -168 131 -27 45 -30 58 -27 120 5 109 47 186 167 305 72 72 116 106 176 138 44 23 87 41 95 39 8 -1 38 -48 66 -103z";

function DoodleSwirl({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 243 200"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(0 200) scale(0.1 -0.1)">
        <path d={SWIRL_PATH} />
      </g>
    </svg>
  );
}

/** Inward coil / spiral. */
function DoodleSpiral({ className }: DoodleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 170 170"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        {...stroke}
        strokeWidth={12}
        d="M128 36C156 62 152 118 108 142C64 166 18 148 12 102C6 58 42 28 82 32C122 36 140 68 132 98C124 128 96 140 72 128C52 118 48 96 60 82C72 68 90 72 94 84"
      />
    </svg>
  );
}

export function HeroDoodles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Left top — reference swirl */}
      <DoodleSwirl className="absolute top-[7%] left-[max(0rem,calc(50%-33rem))] hidden w-36 text-foreground/18 sm:block md:w-44 lg:left-[max(0.25rem,calc(50%-39rem))] lg:w-52 dark:text-foreground/28" />

      {/* Right top — spiral */}
      <DoodleSpiral className="absolute top-[5%] right-[max(0.25rem,calc(50%-32rem))] hidden w-24 rotate-[14deg] text-foreground/16 sm:block md:w-28 lg:right-[max(0.5rem,calc(50%-38rem))] lg:w-32 dark:text-foreground/26" />
    </div>
  );
}

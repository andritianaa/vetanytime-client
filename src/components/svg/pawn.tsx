export type PawnProps = {
  variant?: "default" | "primary" | "muted";
  className?: string;
};

const variantColors: Record<NonNullable<PawnProps["variant"]>, string> = {
  default: "#00BFA9",
  primary: "#CCF2EE",
  muted: "#575757",
};

export const Pawn = ({ variant = "default", className }: PawnProps) => {
  const color = variantColors[variant];

  return (
    <svg
      width="334"
      height="334"
      viewBox="0 0 334 334"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M183.313 256.912L185.529 252.212C188.489 245.936 193.821 241.092 200.352 238.747C206.883 236.402 214.078 236.747 220.355 239.707L225.054 241.923C233.522 245.916 243.228 246.382 252.039 243.218L256.058 241.775C274.405 235.186 283.938 214.972 277.349 196.624C273.361 185.516 264.085 177.137 252.63 174.294C239.743 171.096 227.765 164.973 217.626 156.399L202.413 143.535C191.789 134.551 177.181 131.914 164.086 136.616C151.205 141.241 141.696 152.286 139.035 165.711L134.818 186.988C132.329 199.546 127.082 211.395 119.457 221.678L119.014 222.274C111.985 231.755 110.158 244.121 114.147 255.228C120.735 273.576 140.95 283.109 159.298 276.52L163.316 275.077C172.127 271.913 179.32 265.379 183.313 256.912Z"
        fill={color}
        fillOpacity="0.2"
      />
      <circle
        cx="93.513"
        cy="175.185"
        r="26"
        transform="rotate(-19.7527 93.513 175.185)"
        fill={color}
        fillOpacity="0.2"
      />
      <circle
        cx="246.511"
        cy="120.246"
        r="26"
        transform="rotate(-19.7527 246.511 120.246)"
        fill={color}
        fillOpacity="0.2"
      />
      <circle
        cx="118.917"
        cy="108.491"
        r="26"
        transform="rotate(-19.7527 118.917 108.491)"
        fill={color}
        fillOpacity="0.2"
      />
      <circle
        cx="184.497"
        cy="84.941"
        r="26"
        transform="rotate(-19.7527 184.497 84.941)"
        fill={color}
        fillOpacity="0.2"
      />
    </svg>
  );
};

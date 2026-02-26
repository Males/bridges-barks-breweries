/**
 * Bold flat bridge illustration — thick outline, solid fill.
 * Clear arch bridge: two piers, arch, deck. Accessible: decorative only.
 */
interface Props {
  className?: string
  size?: number
  fill?: string
  stroke?: string
}

export default function BridgeIcon({
  className = '',
  size = 48,
  fill = 'currentColor',
  stroke = '#1A1344',
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Water / base */}
      <path
        d="M4 38h40v4H4z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Left pier */}
      <path
        d="M10 38V22h4v16h-4z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right pier */}
      <path
        d="M34 38V22h4v16h-4z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Arch (clear bridge arch over the gap) */}
      <path
        d="M14 22c0-5 4.5-10 10-10s10 5 10 10"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Deck (walking surface across) */}
      <path
        d="M14 24h20"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Railings / parapet hint */}
      <path
        d="M14 20v4M24 16v12M34 20v4"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

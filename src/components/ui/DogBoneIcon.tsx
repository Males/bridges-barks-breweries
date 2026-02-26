/**
 * Bold flat dog bone — two rounded ends and centre bar with knobs.
 * Thick outline, solid fill. Accessible: decorative only.
 */
interface Props {
  className?: string
  size?: number
  fill?: string
  stroke?: string
}

export default function DogBoneIcon({
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
      {/* Left knob */}
      <circle
        cx="12"
        cy="24"
        r="8"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      {/* Right knob */}
      <circle
        cx="36"
        cy="24"
        r="8"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      {/* Centre bar (rounded rect) */}
      <rect
        x="20"
        y="20"
        width="8"
        height="8"
        rx="2"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      {/* Top knob */}
      <circle
        cx="24"
        cy="14"
        r="5"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      {/* Bottom knob */}
      <circle
        cx="24"
        cy="34"
        r="5"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
    </svg>
  )
}

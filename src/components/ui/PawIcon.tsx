/**
 * Bold flat paw print — one main pad + four toes (dog paw).
 * Thick outline, solid fill. Accessible: decorative only.
 */
interface Props {
  className?: string
  size?: number
  fill?: string
  stroke?: string
}

export default function PawIcon({
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
      {/* Main pad (oval, bottom centre) */}
      <ellipse
        cx="24"
        cy="32"
        rx="10"
        ry="8"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
      />
      {/* Four toe pads in an arc above the main pad */}
      <circle cx="14" cy="16" r="5" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <circle cx="22" cy="12" r="5" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <circle cx="26" cy="12" r="5" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <circle cx="34" cy="16" r="5" fill={fill} stroke={stroke} strokeWidth="2.5" />
    </svg>
  )
}

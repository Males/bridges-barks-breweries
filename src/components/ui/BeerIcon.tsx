/**
 * Bold flat beer mug — thick outline, solid fill.
 * Clear mug: body, handle, foam line. Accessible: decorative only.
 */
interface Props {
  className?: string
  size?: number
  fill?: string
  stroke?: string
  variant?: 'mug' | 'pint'
}

export default function BeerIcon({
  className = '',
  size = 48,
  fill = 'currentColor',
  stroke = '#1A1344',
  variant = 'mug',
}: Props) {
  if (variant === 'pint') {
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
        {/* Pint: tapered glass */}
        <path
          d="M18 8h12l-2 28H20L18 8z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M18 12h12" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

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
      {/* Mug body — rounded rectangle */}
      <path
        d="M12 14h18v20a4 4 0 01-4 4H16a4 4 0 01-4-4V14z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Handle */}
      <path
        d="M30 20v12c0 2 1.5 4 3 4"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Foam / beer line at top */}
      <path
        d="M14 20h16"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

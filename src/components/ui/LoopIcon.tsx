/**
 * Bold flat loop / circular arrow — for "loop" walks.
 * Accessible: decorative only; pair with "Loop" text.
 */
interface Props {
  className?: string
  size?: number
  fill?: string
  stroke?: string
}

export default function LoopIcon({
  className = '',
  size = 48,
  fill = 'none',
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
      <path
        d="M38 24c0 7.7-6.3 14-14 14S10 31.7 10 24 16.3 10 24 10c4 0 7.5 1.7 10 4.3"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M32 10l6 2-2 6"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

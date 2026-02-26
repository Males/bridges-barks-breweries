export default function WalkCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white border-2 border-navy shadow-[5px_5px_0px_#1A1344]"
      role="status"
      aria-label="Loading walk..."
    >
      {/* Header placeholder */}
      <div className="bg-cobalt/20 px-4 py-5 space-y-2">
        <div className="h-6 shimmer rounded-full w-2/3" />
        <div className="h-4 shimmer rounded-full w-1/3" />
      </div>

      {/* Map placeholder */}
      <div className="h-52 shimmer border-y-2 border-navy/20" />

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="h-4 shimmer rounded-full w-full" />
        <div className="h-4 shimmer rounded-full w-3/4" />

        {/* Primary button placeholder */}
        <div className="h-14 shimmer rounded-xl w-full mt-2" />

        {/* Grid placeholder */}
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 shimmer rounded-xl" />
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-1.5 pb-4">
        <span
          className="w-2 h-2 rounded-full bg-cobalt dot-bounce"
          style={{ '--dot-i': '0' } as React.CSSProperties}
          aria-hidden="true"
        />
        <span
          className="w-2 h-2 rounded-full bg-hot-pink dot-bounce"
          style={{ '--dot-i': '1' } as React.CSSProperties}
          aria-hidden="true"
        />
        <span
          className="w-2 h-2 rounded-full bg-golden dot-bounce"
          style={{ '--dot-i': '2' } as React.CSSProperties}
          aria-hidden="true"
        />
      </div>

      <span className="sr-only">Finding a walk for you…</span>
    </div>
  )
}

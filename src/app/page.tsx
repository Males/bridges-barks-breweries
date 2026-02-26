import LocationInput from '@/components/landing/LocationInput'
import { BridgeIcon, DogBoneIcon, BeerIcon } from '@/components/ui'

export default function LandingPage() {
  return (
    <main
      id="main-content"
      className="min-h-svh flex flex-col items-center justify-center px-4 py-8 sm:px-5 sm:py-12 overflow-hidden safe-area-padding mx-6"
    >
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10 max-w-sm w-full">
        {/* Illustration row — bold flat style */}
        <div
          className="flex items-center justify-center gap-4 sm:gap-5 mb-5 sm:mb-6"
          aria-hidden="true"
        >
          <span
            className="inline-block animate-bounce-in text-cobalt"
            style={{ animationDelay: '0ms' } as React.CSSProperties}
          >
            <BridgeIcon size={56} fill="#2B4EFF" stroke="#1A1344" />
          </span>
          <span
            className="inline-block animate-bounce-in text-hot-pink"
            style={{ animationDelay: '120ms' } as React.CSSProperties}
          >
            <DogBoneIcon size={56} fill="#FF3BA0" stroke="#1A1344" />
          </span>
          <span
            className="inline-block animate-bounce-in text-golden"
            style={{ animationDelay: '240ms' } as React.CSSProperties}
          >
            <BeerIcon size={56} fill="#FFE600" stroke="#1A1344" />
          </span>
        </div>

        {/* Title block with coloured underline accent */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' } as React.CSSProperties}>
          <h1 className="hero-title font-display text-navy font-bold leading-tight mb-1">
            Bridges, Barks
            <br />
            <span className="relative inline-block">
              &amp; Breweries
              <span
                className="absolute -bottom-1 left-0 right-0 h-3 bg-golden -z-10 rounded"
                aria-hidden="true"
              />
            </span>
          </h1>
        </div>

        <p
          className="text-navy/70 text-base leading-relaxed mt-3 sm:mt-4 animate-fade-in max-w-[20rem] mx-auto"
          style={{ animationDelay: '250ms' } as React.CSSProperties}
        >
          Loop walks with bridges &amp; a brewery stop for you and the dog.
        </p>
      </div>

      {/* Search input — relative z-10 so dropdown appears above feature blocks */}
      <div
        className="w-full max-w-md animate-slide-up relative z-10"
        style={{ animationDelay: '200ms' } as React.CSSProperties}
      >
        <p
          className="text-sm font-bold text-navy mb-2 text-center uppercase tracking-wide"
        >
          Pick your starting spot
        </p>
        <LocationInput />
      </div>

      {/* Reassurance */}
      <p
        className="mt-4 sm:mt-5 text-xs text-navy/50 text-center animate-fade-in"
        style={{ animationDelay: '400ms' } as React.CSSProperties}
      >
        No account needed · No data stored · Powered by OpenStreetMap
      </p>

      {/* Feature cards — bold coloured blocks, not buttons (no shadow) */}
      <div
        className="mt-8 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-3 max-w-sm w-full animate-slide-up relative z-0"
        style={{ animationDelay: '300ms' } as React.CSSProperties}
        role="list"
        aria-label="What you get: bridges, dog-friendly routes, brewery stop"
      >
        <div
          className="flex flex-col items-center gap-1.5 sm:gap-2 bg-cobalt border-2 border-navy rounded-xl p-3 min-h-[5.5rem]"
          role="listitem"
        >
          <BridgeIcon size={36} fill="#FFFEF5" stroke="#1A1344" />
          <p className="text-xs font-bold text-white text-center leading-tight">
            Crosses bridges
          </p>
        </div>
        <div
          className="flex flex-col items-center gap-1.5 sm:gap-2 bg-hot-pink border-2 border-navy rounded-xl p-3 min-h-[5.5rem]"
          role="listitem"
        >
          <DogBoneIcon size={36} fill="#FFFEF5" stroke="#1A1344" />
          <p className="text-xs font-bold text-white text-center leading-tight">Dog friendly</p>
        </div>
        <div
          className="flex flex-col items-center gap-1.5 sm:gap-2 bg-golden border-2 border-navy rounded-xl p-3 min-h-[5.5rem]"
          role="listitem"
        >
          <BeerIcon size={36} fill="#1A1344" stroke="#1A1344" />
          <p className="text-xs font-bold text-navy text-center leading-tight">Brewery stop</p>
        </div>
      </div>
    </main>
  )
}

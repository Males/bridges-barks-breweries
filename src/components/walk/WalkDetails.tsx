'use client'

import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Navigation,
  MapPin,
  RotateCw,
  Merge,
  GitBranch,
} from 'lucide-react'
import type { Walk } from '@/types'
import { useWalkStore } from '@/store/useWalkStore'
import { metersToKm, formatDuration } from '@/lib/utils'
import { LoopIcon } from '@/components/ui'
import BridgeList from './BridgeList'
import VenueList from './VenueList'

const MapFullDynamic = dynamic(() => import('@/components/map/MapFull'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] shimmer" aria-hidden="true" />
  ),
})

interface Props {
  walk: Walk
}

const iconSize = 18

function ManeuverIcon({ maneuver }: { maneuver: string }) {
  const normalized = maneuver?.toLowerCase() || ''
  const props = { size: iconSize, className: 'text-navy flex-shrink-0', 'aria-hidden': true as const }
  if (normalized === 'depart') return <MapPin {...props} />
  if (normalized === 'arrive') return <MapPin {...props} />
  if (normalized === 'turn' || normalized === 'end of road') return <ArrowRight {...props} />
  if (normalized === 'merge') return <Merge {...props} />
  if (normalized === 'roundabout') return <RotateCw {...props} />
  if (normalized === 'fork') return <GitBranch {...props} />
  return <ArrowUp {...props} />
}

export default function WalkDetails({ walk }: Props) {
  const setView = useWalkStore((s) => s.setView)

  return (
    <div
      className="fixed inset-0 z-50 bg-cream overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Walk details"
    >
      {/* Cobalt header */}
      <header className="sticky top-0 z-10 bg-cobalt border-b-2 border-navy px-5 sm:px-6 py-3 flex items-center gap-3 safe-area-padding">
        <button
          onClick={() => setView('card')}
          aria-label="Back to walk card"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors border-2 border-white/40"
        >
          <ArrowLeft size={18} className="text-white" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-lg text-white font-bold leading-tight truncate">
            {walk.venue.name}
          </h1>
          <p className="text-white/70 text-xs flex items-center gap-1 flex-wrap">
            {metersToKm(walk.distanceMeters)} · {formatDuration(walk.durationMinutes)} ·{' '}
            {walk.bridges.length} {walk.bridges.length === 1 ? 'bridge' : 'bridges'} ·{' '}
            <span className="inline-flex items-center gap-0.5">
              <LoopIcon size={12} stroke="#fff" />
              Loop
            </span>
          </p>
        </div>
      </header>

      {/* Full Map */}
      <div className="border-b-2 border-navy">
        <MapFullDynamic
          route={walk.route}
          bridges={walk.bridges}
          venue={walk.venue}
          startPoint={walk.startPoint}
        />
      </div>

      <div className="px-5 sm:px-6 py-6 space-y-6" id="main-content">
        {/* Start & end — loop is same point */}
        <section
          aria-label="Start and end of walk"
          className="flex flex-wrap gap-3 animate-slide-up"
        >
          <div className="flex items-center gap-2 bg-lime/30 border-2 border-navy rounded-xl px-4 py-2.5">
            <span className="text-sm font-bold text-navy">Start &amp; end</span>
            <span className="text-xs text-navy/70">(same place — loop)</span>
          </div>
          <div className="flex items-center gap-2 bg-golden/30 border-2 border-navy rounded-xl px-4 py-2.5">
            <span className="text-sm font-bold text-navy">Brewery stop</span>
            <span className="text-xs text-navy/70">{walk.venue.name}</span>
          </div>
        </section>

        {/* Route Steps */}
        {walk.steps.length > 0 ? (
          <section aria-label="Turn-by-turn directions" className="animate-slide-up">
            <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-navy">
              <span className="bg-cobalt text-white rounded-lg p-1.5 inline-flex">
                <Navigation size={14} aria-hidden="true" />
              </span>
              Directions
            </h2>
            <ol className="space-y-0 border-2 border-navy rounded-xl overflow-hidden shadow-[3px_3px_0px_#1A1344]">
              {walk.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 bg-white border-b-2 border-navy/10 last:border-0"
                >
                  <span className="w-7 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ManeuverIcon maneuver={step.maneuver} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy font-medium">{step.instruction}</p>
                    {step.distanceMeters > 5 && (
                      <p className="text-xs text-navy/50 mt-0.5">
                        {metersToKm(step.distanceMeters)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <section
            aria-label="Route overview"
            className="bg-golden/20 border-2 border-navy rounded-xl p-4 animate-slide-up"
          >
            <p className="text-sm text-navy font-medium">
              Follow the route on the map. Start at the start point, cross each bridge, stop at the
              brewery, then loop back.
            </p>
          </section>
        )}

        {/* Bridges */}
        <div className="animate-slide-up" style={{ animationDelay: '80ms' }}>
          <BridgeList bridges={walk.bridges} />
        </div>

        {/* Venue */}
        <div className="animate-slide-up" style={{ animationDelay: '160ms' }}>
          <VenueList venue={walk.venue} />
        </div>

        {/* Summary pill */}
        <div
          className="bg-navy text-white rounded-xl p-4 text-sm font-medium animate-slide-up"
          style={{ animationDelay: '240ms' }}
        >
          <p>{walk.summary}</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { Clock, Route } from 'lucide-react'
import type { Walk } from '@/types'
import { metersToKm, formatDuration } from '@/lib/utils'
import { BridgeIcon, BeerIcon, LoopIcon } from '@/components/ui'
import WalkActions from './WalkActions'

const MapPreviewDynamic = dynamic(() => import('@/components/map/MapPreview'), {
  ssr: false,
  loading: () => <div className="h-52 shimmer" aria-hidden="true" />,
})

interface Props {
  walk: Walk
}

export default function WalkCard({ walk }: Props) {
  const isTaproom = walk.venue.isTaproom || walk.venue.type === 'taproom'

  return (
    <article
      className="rounded-2xl overflow-hidden bg-white border-2 border-navy shadow-[5px_5px_0px_#1A1344] animate-slide-up"
      aria-label={`Walk via ${walk.venue.name}`}
    >
      {/* Cobalt header strip */}
      <div className="bg-cobalt px-4 py-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl text-white font-bold leading-tight">
            {walk.venue.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {isTaproom ? (
              <span className="inline-flex items-center text-xs font-bold bg-lime text-navy px-2.5 py-0.5 rounded-full">
                ✓ Taproom
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                {walk.venue.type.charAt(0).toUpperCase() + walk.venue.type.slice(1)}
              </span>
            )}
            <span className="text-white/80 text-xs flex items-center gap-1">
              <Route size={11} aria-hidden="true" />
              {metersToKm(walk.distanceMeters)}
            </span>
            <span className="text-white/80 text-xs flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              {formatDuration(walk.durationMinutes)}
            </span>
            <span className="text-white/80 text-xs flex items-center gap-1">
              <BridgeIcon size={14} fill="#fff" stroke="#fff" />
              {walk.bridges.length} {walk.bridges.length === 1 ? 'bridge' : 'bridges'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <BeerIcon
            size={28}
            variant={isTaproom ? 'pint' : 'mug'}
            fill="#FFE600"
            stroke="#1A1344"
          />
          <span className="text-xs font-bold bg-golden text-navy px-2 py-0.5 rounded-full border border-navy inline-flex items-center gap-1">
            <LoopIcon size={12} stroke="#1A1344" />
            Loop
          </span>
        </div>
      </div>

      {/* Map Preview */}
      <div className="border-y-2 border-navy">
        <MapPreviewDynamic
          route={walk.route}
          bridges={walk.bridges}
          venue={walk.venue}
          startPoint={walk.startPoint}
        />
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-navy/70 leading-snug">{walk.summary}</p>
        <p className="text-xs text-navy/40">
          Start is {metersToKm(walk.distanceFromLocationMeters)} from your location
        </p>
        <WalkActions />
      </div>
    </article>
  )
}

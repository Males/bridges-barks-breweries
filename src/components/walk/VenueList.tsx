import { ExternalLink } from 'lucide-react'
import type { Venue } from '@/types'
import { BeerIcon } from '@/components/ui'

interface Props {
  venue: Venue
}

const typeLabels: Record<Venue['type'], string> = {
  taproom: 'Taproom',
  brewery: 'Brewery',
  pub: 'Pub',
  bar: 'Bar',
}

const typeBadgeColors: Record<Venue['type'], string> = {
  taproom: 'bg-lime text-navy',
  brewery: 'bg-cobalt text-white',
  pub: 'bg-hot-pink text-white',
  bar: 'bg-hot-pink text-white',
}

export default function VenueList({ venue }: Props) {
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(venue.name)}/@${venue.lat},${venue.lon},17z`
  const appleMapsUrl = `maps://maps.apple.com/?q=${encodeURIComponent(venue.name)}&ll=${venue.lat},${venue.lon}`
  const isTaproom = venue.isTaproom || venue.type === 'taproom'

  return (
    <section aria-label="Brewery stop">
      <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-navy">
        <span className="bg-golden text-navy rounded-lg p-1.5 inline-flex border border-navy" aria-hidden="true">
          <BeerIcon size={20} fill="#1A1344" stroke="#1A1344" variant="mug" />
        </span>
        Brewery Stop
      </h3>

      <div className="bg-white border-2 border-navy rounded-xl p-4 shadow-[3px_3px_0px_#1A1344]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-navy text-base">{venue.name}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border-2 border-navy ${typeBadgeColors[venue.type]}`}
              >
                {isTaproom && venue.type !== 'taproom' ? '✓ Taproom' : typeLabels[venue.type]}
              </span>
              {isTaproom && venue.type === 'brewery' && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border-2 border-navy bg-lime text-navy">
                  ✓ Taproom
                </span>
              )}
            </div>
          </div>
          <span className="flex-shrink-0 text-golden" aria-hidden="true">
            <BeerIcon size={36} fill="#FFE600" stroke="#1A1344" variant={isTaproom ? 'pint' : 'mug'} />
          </span>
        </div>

        {/* Map deep links */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-bold bg-cobalt text-white border-2 border-navy rounded-xl px-4 py-2.5 hover:bg-cobalt-dark transition-colors shadow-[2px_2px_0px_#1A1344]"
            aria-label={`Open ${venue.name} in Google Maps`}
          >
            <ExternalLink size={14} aria-hidden="true" />
            Google Maps
          </a>
          <a
            href={appleMapsUrl}
            className="flex items-center gap-1.5 text-sm font-bold bg-white text-navy border-2 border-navy rounded-xl px-4 py-2.5 hover:bg-navy/5 transition-colors shadow-[2px_2px_0px_#1A1344]"
            aria-label={`Open ${venue.name} in Apple Maps`}
          >
            <ExternalLink size={14} aria-hidden="true" />
            Apple Maps
          </a>
        </div>
      </div>
    </section>
  )
}

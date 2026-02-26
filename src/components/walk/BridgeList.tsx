import type { Bridge } from '@/types'
import { BridgeIcon } from '@/components/ui'

interface Props {
  bridges: Bridge[]
}

export default function BridgeList({ bridges }: Props) {
  return (
    <section aria-label="Bridges on this walk">
      <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-navy">
        <span className="bg-cobalt text-white rounded-lg p-1.5 inline-flex" aria-hidden="true">
          <BridgeIcon size={20} fill="#fff" stroke="#fff" />
        </span>
        Bridges ({bridges.length})
      </h3>
      <ul className="space-y-2">
        {bridges.map((bridge) => (
          <li
            key={bridge.id}
            className="flex items-start gap-3 bg-white border-2 border-navy rounded-xl p-3 shadow-[2px_2px_0px_#1A1344]"
          >
            <span className="mt-0.5 flex-shrink-0 text-cobalt" aria-hidden="true">
              <BridgeIcon size={24} fill="#2B4EFF" stroke="#1A1344" />
            </span>
            <div>
              <p className="font-bold text-sm text-navy">
                {bridge.name || 'Unnamed bridge'}
              </p>
              {bridge.tags.highway && (
                <p className="text-xs text-navy/50 capitalize mt-0.5">
                  {bridge.tags.highway} crossing
                </p>
              )}
              <a
                href={`https://www.openstreetmap.org/${bridge.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cobalt font-semibold hover:underline mt-1 inline-block"
              >
                View on OpenStreetMap ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

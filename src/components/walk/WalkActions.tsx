'use client'

import {
  Check,
  ArrowLeftRight,
  Maximize2,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWalkStore } from '@/store/useWalkStore'
import { BridgeIcon, BeerIcon } from '@/components/ui'

export default function WalkActions() {
  const { isLoading, setView, adjustLength, adjustProximity, rerollVenue, rerollBridges, rerollFull } =
    useWalkStore()

  const secondaryActions = [
    { label: 'Too long',     icon: ArrowLeftRight, action: () => adjustLength('shorter') },
    { label: 'Too short',    icon: Maximize2,      action: () => adjustLength('longer') },
    { label: 'Too far',      icon: MapPin,         action: () => adjustProximity() },
    { label: 'Diff brewery', icon: 'beer' as const, action: () => rerollVenue() },
    { label: 'Diff bridge',  icon: 'bridge' as const, action: () => rerollBridges() },
    { label: 'Try again',    icon: RefreshCw,      action: () => rerollFull() },
  ]

  return (
    <div className="space-y-2.5" role="group" aria-label="Walk options">
      {/* Primary CTA — golden fill, hard shadow */}
      <button
        onClick={() => setView('detail')}
        disabled={isLoading}
        aria-label="I want this walk"
        className={cn(
          'w-full flex items-center justify-center gap-2.5',
          'bg-golden text-navy font-bold text-base rounded-xl py-4',
          'border-2 border-navy shadow-[3px_3px_0px_#1A1344]',
          'transition-all duration-150 active:scale-[0.97] active:shadow-none hover:-translate-y-0.5',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        )}
      >
        <Check size={20} strokeWidth={2.5} aria-hidden="true" />
        I want this walk
      </button>

      {/* 2×3 grid of secondary actions — no shadow so not confused with primary */}
      <div className="grid grid-cols-2 gap-2">
        {secondaryActions.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            disabled={isLoading}
            aria-label={btn.label}
            className={cn(
              'flex items-center justify-center gap-1.5',
              'bg-white text-navy font-semibold text-sm rounded-xl',
              'border-2 border-navy py-3 px-2 min-h-[48px]',
              'transition-all duration-150 active:scale-[0.97]',
              'hover:bg-cobalt hover:text-white hover:border-cobalt',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {btn.icon === 'beer' ? (
              <BeerIcon size={18} fill="currentColor" stroke="#1A1344" className="flex-shrink-0" />
            ) : btn.icon === 'bridge' ? (
              <BridgeIcon size={18} fill="currentColor" stroke="#1A1344" className="flex-shrink-0" />
            ) : (
              <btn.icon size={14} strokeWidth={2.5} aria-hidden="true" className="flex-shrink-0" />
            )}
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { useWalkStore } from '@/store/useWalkStore'
import WalkCard from '@/components/walk/WalkCard'
import WalkCardSkeleton from '@/components/walk/WalkCardSkeleton'
import WalkDetails from '@/components/walk/WalkDetails'

export default function WalkPage() {
  const router = useRouter()
  const { location, currentWalk, isLoading, error, view, generateWalk } = useWalkStore()
  const hasGeneratedRef = useRef(false)

  useEffect(() => {
    if (!location) {
      router.replace('/')
    }
  }, [location, router])

  useEffect(() => {
    if (location && !currentWalk && !isLoading && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true
      generateWalk()
    }
  }, [location, currentWalk, isLoading, generateWalk])

  if (!location) return null

  if (view === 'detail' && currentWalk) {
    return <WalkDetails walk={currentWalk} />
  }

  return (
    <main
      id="main-content"
      className="min-h-svh bg-cream px-6 pb-10 safe-area-padding"
      style={{ paddingLeft: '24px', paddingRight: '24px' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-cream/95 backdrop-blur-sm py-4 flex items-center gap-3 border-b-2 border-navy/10 mb-5 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <Link
          href="/"
          aria-label="Back to search"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-navy hover:bg-golden transition-colors flex-shrink-0 shadow-[2px_2px_0px_#1A1344]"
        >
          <ArrowLeft size={18} className="text-navy" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-navy/40 font-medium uppercase tracking-wide">Walking near</p>
          <p className="font-bold text-navy truncate">{location.name}</p>
        </div>
      </header>

      {/* Page title */}
      <div className="mb-5 animate-slide-up">
        <h1 className="font-display text-2xl text-navy font-bold">
          Here&apos;s a good one
        </h1>
        <p className="text-navy/50 text-sm mt-1">Fancy it?</p>
      </div>

      {/* Content */}
      {isLoading && !currentWalk && <WalkCardSkeleton />}

      {error && (
        <div
          className="rounded-2xl bg-coral/10 border-2 border-coral p-5 flex flex-col items-center text-center gap-3 shadow-[3px_3px_0px_#FF4530] animate-slide-up"
          role="alert"
        >
          <AlertCircle size={32} className="text-coral" aria-hidden="true" />
          <div>
            <p className="font-bold text-navy text-sm">Couldn&apos;t find a walk</p>
            <p className="text-navy/60 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => generateWalk()}
            className="flex items-center gap-2 bg-golden text-navy border-2 border-navy rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-golden-dark transition-colors shadow-[2px_2px_0px_#1A1344]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {currentWalk && !error && (
        <div className="relative">
          {/* Loading overlay on re-generate */}
          {isLoading && (
            <div
              className="absolute inset-0 z-10 bg-cream/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              aria-live="polite"
              aria-label="Finding a different walk..."
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full bg-cobalt dot-bounce"
                    style={{ '--dot-i': '0' } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  <span
                    className="w-3 h-3 rounded-full bg-hot-pink dot-bounce"
                    style={{ '--dot-i': '1' } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  <span
                    className="w-3 h-3 rounded-full bg-golden dot-bounce"
                    style={{ '--dot-i': '2' } as React.CSSProperties}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-navy font-bold">Finding a new walk…</p>
              </div>
            </div>
          )}
          <WalkCard key={currentWalk.id} walk={currentWalk} />
        </div>
      )}
    </main>
  )
}

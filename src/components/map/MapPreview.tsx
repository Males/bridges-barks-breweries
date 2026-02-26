'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Bridge, Venue } from '@/types'
import { getMarkerHtml } from '@/lib/mapMarkerIcons'
import 'leaflet/dist/leaflet.css'

interface Props {
  route: [number, number][]
  bridges: Bridge[]
  venue: Venue
  startPoint: { lat: number; lon: number }
}

function BoundsUpdater({ route }: { route: [number, number][] }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (route.length > 0 && !fitted.current) {
      map.fitBounds(route as [number, number][], { padding: [20, 20] })
      fitted.current = true
    }
  }, [map, route])

  return null
}

const PREVIEW_MARKER_SIZE = 24

function createPreviewIcon(type: 'start' | 'bridge' | 'venue'): L.DivIcon {
  return L.divIcon({
    html: getMarkerHtml(type, PREVIEW_MARKER_SIZE),
    className: '',
    iconSize: [PREVIEW_MARKER_SIZE, PREVIEW_MARKER_SIZE],
    iconAnchor: [PREVIEW_MARKER_SIZE / 2, PREVIEW_MARKER_SIZE],
  })
}

export default function MapPreview({ route, bridges, venue, startPoint }: Props) {
  if (route.length === 0) return <div className="h-52 bg-amber-50 rounded-t-2xl" />

  const center: [number, number] = route[Math.floor(route.length / 2)]

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '208px', width: '100%' }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      keyboard={false}
      touchZoom={false}
      attributionControl={false}
      aria-hidden="true"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <BoundsUpdater route={route} />

      {/* Route polyline */}
      <Polyline positions={route} color="#d97706" weight={3} opacity={0.9} />

      {/* Start & end marker (loop — same point) */}
      <Marker
        position={[startPoint.lat, startPoint.lon]}
        icon={createPreviewIcon('start')}
      />

      {/* Bridge markers */}
      {bridges.map((b) => (
        <Marker
          key={b.id}
          position={[b.lat, b.lon]}
          icon={createPreviewIcon('bridge')}
        />
      ))}

      {/* Venue marker */}
      <Marker
        position={[venue.lat, venue.lon]}
        icon={createPreviewIcon('venue')}
      />
    </MapContainer>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet'
import type { Bridge, Venue } from '@/types'
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
      <CircleMarker
        center={[startPoint.lat, startPoint.lon]}
        radius={8}
        fillColor="#166534"
        color="#1A1344"
        weight={2}
        fillOpacity={1}
      />

      {/* Bridge markers */}
      {bridges.map((b) => (
        <CircleMarker
          key={b.id}
          center={[b.lat, b.lon]}
          radius={5}
          fillColor="#78350f"
          color="white"
          weight={2}
          fillOpacity={1}
        />
      ))}

      {/* Venue marker */}
      <CircleMarker
        center={[venue.lat, venue.lon]}
        radius={8}
        fillColor="#d97706"
        color="white"
        weight={2}
        fillOpacity={1}
      />
    </MapContainer>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
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

const MARKER_SIZE = 32

function createMapIcon(type: 'start' | 'bridge' | 'venue'): L.DivIcon {
  return L.divIcon({
    html: getMarkerHtml(type, MARKER_SIZE),
    className: '',
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE],
    popupAnchor: [0, -MARKER_SIZE],
  })
}

function BoundsUpdater({ route }: { route: [number, number][] }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (route.length > 0 && !fitted.current) {
      map.fitBounds(route as [number, number][], { padding: [40, 40] })
      fitted.current = true
    }
  }, [map, route])

  return null
}

export default function MapFull({ route, bridges, venue, startPoint }: Props) {
  if (route.length === 0) return <div className="h-[50vh] bg-amber-50" />

  const center: [number, number] = route[Math.floor(route.length / 2)]

  const startEndIcon = createMapIcon('start')
  const venueIcon = createMapIcon('venue')
  const bridgeIcon = createMapIcon('bridge')

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '50vh', width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <BoundsUpdater route={route} />

      <Polyline positions={route} color="#d97706" weight={4} opacity={0.85} />

      {/* Start & end (same point — loop) */}
      <Marker position={[startPoint.lat, startPoint.lon]} icon={startEndIcon}>
        <Popup>
          <strong>Start &amp; end</strong>
          <br />
          <span className="text-navy/70">Loop — walk returns here</span>
        </Popup>
      </Marker>

      {bridges.map((b) => (
        <Marker key={b.id} position={[b.lat, b.lon]} icon={bridgeIcon}>
          <Popup>
            <strong>{b.name || 'Bridge'}</strong>
          </Popup>
        </Marker>
      ))}

      <Marker position={[venue.lat, venue.lon]} icon={venueIcon}>
        <Popup>
          <strong>Brewery stop</strong>
          <br />
          {venue.name}
          {venue.isTaproom && (
            <>
              <br />
              <span className="text-navy/70">Taproom</span>
            </>
          )}
        </Popup>
      </Marker>
    </MapContainer>
  )
}

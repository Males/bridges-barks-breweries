'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Bridge, Venue } from '@/types'
import 'leaflet/dist/leaflet.css'

interface Props {
  route: [number, number][]
  bridges: Bridge[]
  venue: Venue
  startPoint: { lat: number; lon: number }
}

/** Labeled marker (no emoji) — bold flat style */
function createLabelIcon(
  label: string,
  bgColor: string,
  borderColor = '#1A1344'
): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      background:${bgColor};
      color:${borderColor};
      border:2px solid ${borderColor};
      border-radius:50%;
      width:32px;
      height:32px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:10px;
      font-weight:bold;
      text-transform:uppercase;
      line-height:1;
      box-shadow:0 2px 4px rgba(0,0,0,0.2);
    ">${label.charAt(0)}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
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

  const startEndIcon = createLabelIcon('S', '#166534', '#1A1344')
  const venueIcon = createLabelIcon('B', '#d97706', '#1A1344')
  const bridgeIcon = createLabelIcon('Br', '#78350f', '#1A1344')

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

# Bridges, Barks & Breweries 🌉🐾🍻

Find a dog walk near you that crosses bridges and ends at a brewery or pub with a taproom.

## What it does

1. **Enter a location** — typeahead autocomplete powered by Photon (OSM data)
2. **Get a walk** — the app finds bridges and breweries/pubs near you via OpenStreetMap, routes through them with OSRM, and shows you a walk card with a live map
3. **Refine it** — too long? too far? don't like the brewery? Hit an action button to reroll
4. **Go walk** — open full details with turn-by-turn directions and deep links to Google Maps or Apple Maps

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 |
| Map | react-leaflet + Leaflet (OSM tiles) |
| State | Zustand (session-only, no persistence) |
| Geocoding | [Photon by Komoot](https://photon.komoot.io) |
| POI data | [Overpass API](https://overpass-api.de) (with mirror fallback) |
| Routing | [OSRM](https://project-osrm.org) public foot endpoint |

**No database. No login. No tracking. No API keys required.**

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building

```bash
npm run build
npm start
```

## Deploying to Vercel

```bash
vercel --prod
```

No environment variables needed — all data sources are free and public.

## Architecture

### API routes (serverless, Next.js)

| Route | Purpose |
|---|---|
| `GET /api/geocode?q=Reading` | Proxies Photon geocoding; returns `Location[]` |
| `POST /api/overpass` | Proxies Overpass API with 5-min in-memory cache and mirror fallback |
| `GET /api/osrm?waypoints=lon,lat;lon,lat` | Proxies OSRM foot routing |

### Walk generation algorithm

1. Geocode location → lat/lon
2. Pick random start point 0.5–1.5 km from location
3. Parallel Overpass queries for bridges + venues
4. Score venues: taproom > brewery > pub/bar; prefer venues that can sit at end of route
5. Select 1–2 bridges between start and venue
6. Route via OSRM (foot profile); fallback to arc polyline if unavailable
7. Score and assemble final `Walk` object

### Taproom detection

A venue is flagged as a taproom if any of:
- OSM tag `craft=brewery`
- OSM tag `microbrewery=yes`
- Name contains: `taproom`, `brewing`, `microbrewery`, `brew co`, `brewery`, `brewhouse`

### Action buttons

| Button | Effect |
|---|---|
| I want this walk | Opens full detail view |
| Too long | Retargets 3 km, regenerates |
| Too short | Retargets 8 km, regenerates |
| Too far away | Reduces start offset radius, regenerates |
| Different brewery | Excludes current venue, regenerates |
| Different bridge | Excludes current bridges, regenerates |
| Try again | Full reset, regenerates |

## Known limitations

- Overpass API can be slow (5–15 s) at peak times — mirrors are tried in order
- Rural areas with few bridges or pubs may return no results ("No bridges found near…")
- OSRM public endpoint may occasionally be unavailable; the app falls back to a simple arc polyline
- Walk distance is a soft target — real-world geography determines the actual route

## Data attribution

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, ODbL.
Routing by [OSRM](https://project-osrm.org).
Geocoding by [Photon](https://photon.komoot.io) (Komoot).

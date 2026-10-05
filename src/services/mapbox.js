import * as mapboxglNS from 'mapbox-gl'
const mapboxgl = mapboxglNS.default ?? mapboxglNS

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export function detectPlaceCategory(label = '') {
  const l = label.toLowerCase()
  if (l.includes('müze') || l.includes('museum') || l.includes('saray') || l.includes('palace') || l.includes('kale') || l.includes('hisar') || l.includes('kule') || l.includes('tower')) {
    return { type: 'museum', iconClass: 'fa-solid fa-landmark', icon: '<i class="fa-solid fa-landmark"></i>', tag: 'Müze & Tarih' }
  }
  if (l.includes('cami') || l.includes('mosque') || l.includes('kilise') || l.includes('church') || l.includes('katedral') || l.includes('cathedral') || l.includes('manastır')) {
    return { type: 'historic', iconClass: 'fa-solid fa-place-of-worship', icon: '<i class="fa-solid fa-place-of-worship"></i>', tag: 'İnanç & Tarih' }
  }
  if (l.includes('park') || l.includes('bahçe') || l.includes('garden') || l.includes('plaj') || l.includes('beach') || l.includes('sahil') || l.includes('orman')) {
    return { type: 'park', iconClass: 'fa-solid fa-tree', icon: '<i class="fa-solid fa-tree"></i>', tag: 'Doğa & Park' }
  }
  if (l.includes('restoran') || l.includes('restaurant') || l.includes('cafe') || l.includes('kafe') || l.includes('kahve') || l.includes('meyhane') || l.includes('kebap') || l.includes('lokanta')) {
    return { type: 'restaurant', iconClass: 'fa-solid fa-utensils', icon: '<i class="fa-solid fa-utensils"></i>', tag: 'Yeme & İçme' }
  }
  if (l.includes('çarşı') || l.includes('bazaar') || l.includes('avm') || l.includes('mall') || l.includes('pazar') || l.includes('market')) {
    return { type: 'shopping', iconClass: 'fa-solid fa-bag-shopping', icon: '<i class="fa-solid fa-bag-shopping"></i>', tag: 'Alışveriş' }
  }
  return { type: 'monument', iconClass: 'fa-solid fa-location-dot', icon: '<i class="fa-solid fa-location-dot"></i>', tag: 'Turistik Nokta' }
}

export function initMap(container, options = {}) {

  try { mapboxgl.config.EVENTS_URL = '' } catch (_) {}

  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: options.center || [28.9784, 41.0082],
    zoom: options.zoom || 12,
    projection: 'mercator',
    antialias: true,
    ...options,
  })

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
  map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right')

  return map
}

export async function fetchIsochrone(lng, lat, profile, minutes) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  if (!token) throw new Error('Mapbox token bulunamadı.')

  const url = new URL(`https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}`)
  url.searchParams.set('contours_minutes', minutes)
  url.searchParams.set('polygons', 'true')
  url.searchParams.set('denoise', '1')
  url.searchParams.set('generalize', '50')
  url.searchParams.set('access_token', token)

  const response = await fetch(url.toString())
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `İzokron API hatası: ${response.status}`)
  }

  return response.json()
}

export async function fetchAllIsochrones(places, constraints) {
  const results = new Map()

  const promises = places.map(async (place) => {
    try {
      const [walkData, transitData] = await Promise.all([
        constraints.walk > 0
          ? fetchIsochrone(place.lngLat.lng, place.lngLat.lat, 'walking', constraints.walk)
          : null,
        constraints.transit > 0
          ? fetchIsochrone(place.lngLat.lng, place.lngLat.lat, 'driving', constraints.transit)
          : null,
      ])

      results.set(place.id, {
        walk: walkData,
        transit: transitData,
      })
    } catch (err) {
      console.error(`[Isochrone] ${place.label} için hata:`, err)
      results.set(place.id, { walk: null, transit: null, error: err.message })
    }
  })

  await Promise.allSettled(promises)
  return results
}

export function addIsochroneLayer(map, placeId, isoData, color) {
  if (isoData.walk) {
    const walkSourceId = `iso-walk-${placeId}`
    const walkLayerId = `iso-walk-layer-${placeId}`

    if (!map.getSource(walkSourceId)) {
      map.addSource(walkSourceId, { type: 'geojson', data: isoData.walk })
    } else {
      map.getSource(walkSourceId).setData(isoData.walk)
    }

    if (!map.getLayer(walkLayerId)) {
      map.addLayer({
        id: walkLayerId,
        type: 'fill',
        source: walkSourceId,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.16,
          'fill-outline-color': color,
        },
      }, 'road-label')
    }

    const walkBorderId = `iso-walk-border-${placeId}`
    if (!map.getLayer(walkBorderId)) {
      map.addLayer({
        id: walkBorderId,
        type: 'line',
        source: walkSourceId,
        paint: {
          'line-color': color,
          'line-width': 1.8,
          'line-dasharray': [3, 2],
        },
      })
    }
  }

  if (isoData.transit) {
    const transitSourceId = `iso-transit-${placeId}`
    const transitLayerId = `iso-transit-layer-${placeId}`

    if (!map.getSource(transitSourceId)) {
      map.addSource(transitSourceId, { type: 'geojson', data: isoData.transit })
    } else {
      map.getSource(transitSourceId).setData(isoData.transit)
    }

    if (!map.getLayer(transitLayerId)) {
      map.addLayer({
        id: transitLayerId,
        type: 'fill',
        source: transitSourceId,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.08,
        },
      }, 'road-label')
    }
  }
}

export function addIntersectionLayer(map, intersectionGeoJSON) {
  const sourceId = 'sweet-spot-source'
  const fillId = 'sweet-spot-fill'
  const lineId = 'sweet-spot-line'
  const glowId = 'sweet-spot-glow'

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, { type: 'geojson', data: intersectionGeoJSON })
  } else {
    map.getSource(sourceId).setData(intersectionGeoJSON)
    return
  }

  map.addLayer({
    id: fillId,
    type: 'fill',
    source: sourceId,
    paint: {
      'fill-color': '#10b981',
      'fill-opacity': 0.32,
    },
  })

  map.addLayer({
    id: glowId,
    type: 'fill',
    source: sourceId,
    paint: {
      'fill-color': '#10b981',
      'fill-opacity': 0.12,
    },
    filter: ['==', '$type', 'Polygon'],
  })

  map.addLayer({
    id: lineId,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': '#34d399',
      'line-width': 3,
      'line-opacity': 0.95,
    },
  })
}

export function removeIsochroneLayers(map, placeId) {
  const layerIds = [
    `iso-walk-layer-${placeId}`,
    `iso-walk-border-${placeId}`,
    `iso-transit-layer-${placeId}`,
  ]
  const sourceIds = [
    `iso-walk-${placeId}`,
    `iso-transit-${placeId}`,
  ]

  layerIds.forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
  sourceIds.forEach(id => { if (map.getSource(id)) map.removeSource(id) })
}

export function removeIntersectionLayer(map) {
  const ids = ['sweet-spot-fill', 'sweet-spot-glow', 'sweet-spot-line']
  ids.forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
  if (map.getSource('sweet-spot-source')) map.removeSource('sweet-spot-source')
}

export async function fetchDirections(places, profile = 'walking') {
  if (!places || places.length < 2) return null
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  if (!token) return null

  const coords = places.map(p => `${p.lngLat.lng},${p.lngLat.lat}`).join(';')
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?geometries=geojson&overview=full&access_token=${token}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Directions API ${res.status}`)
    const data = await res.json()
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry
    }
  } catch (err) {
    console.warn('[Directions] API hatası, doğrudan bağlantı rotası çiziliyor:', err)
  }

  return {
    type: 'LineString',
    coordinates: places.map(p => [p.lngLat.lng, p.lngLat.lat]),
  }
}

export function addRouteLayer(map, routeGeometry) {
  if (!map || !routeGeometry) return

  const sourceId = 'trip-route-source'
  const glowLayerId = 'trip-route-glow'
  const casingLayerId = 'trip-route-casing'
  const lineLayerId = 'trip-route-line'

  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: routeGeometry,
  }

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson)
    return
  }

  map.addSource(sourceId, {
    type: 'geojson',
    data: geojson,
  })

  map.addLayer({
    id: glowLayerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#38bdf8',
      'line-width': 10,
      'line-opacity': 0.4,
      'line-blur': 4,
    },
  })

  map.addLayer({
    id: casingLayerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#030712',
      'line-width': 5.5,
      'line-opacity': 0.85,
    },
  })

  map.addLayer({
    id: lineLayerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#38bdf8',
      'line-width': 3.5,
      'line-dasharray': [2, 1.2],
    },
  })
}

export function removeRouteLayer(map) {
  if (!map) return
  const layers = ['trip-route-line', 'trip-route-casing', 'trip-route-glow']
  layers.forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  if (map.getSource('trip-route-source')) {
    map.removeSource('trip-route-source')
  }
}

export function getGoogleMapsRouteUrl(places, sweetSpot = null) {
  if (!places || places.length === 0) return 'https://www.google.com/maps'

  if (places.length === 1) {
    const { lat, lng } = places[0].lngLat
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }

  const stops = places.map(p => `${p.lngLat.lat},${p.lngLat.lng}`)
  return `https://www.google.com/maps/dir/${stops.join('/')}`
}

export function getGoogleMapsRouteWithHotelUrl(places, sweetSpot = null) {
  if (!places || places.length === 0) return 'https://www.google.com/maps'

  if (sweetSpot?.center) {
    const [cLng, cLat] = sweetSpot.center.geometry.coordinates
    const stops = [
      `${cLat.toFixed(5)},${cLng.toFixed(5)}`,
      ...places.map(p => `${p.lngLat.lat},${p.lngLat.lng}`),
    ]
    return `https://www.google.com/maps/dir/${stops.join('/')}`
  }

  return getGoogleMapsRouteUrl(places)
}

export function getPlaceImage(label = '') {
  const l = label.toLowerCase()
  if (l.includes('ayasofya') || l.includes('hagia sophia')) {
    return 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('topkapı') || l.includes('topkapi') || l.includes('saray') || l.includes('palace')) {
    return 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('galata') || l.includes('kule') || l.includes('tower')) {
    return 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('sultanahmet') || l.includes('cami') || l.includes('mosque') || l.includes('kilise') || l.includes('church')) {
    return 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('çarşı') || l.includes('bazaar') || l.includes('pazar') || l.includes('avm')) {
    return 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('park') || l.includes('bahçe') || l.includes('sahil') || l.includes('plaj') || l.includes('beach')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('restoran') || l.includes('restaurant') || l.includes('cafe') || l.includes('kafe') || l.includes('meyhane')) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('colosseum') || l.includes('roma') || l.includes('rome')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('eyfel') || l.includes('eiffel') || l.includes('paris') || l.includes('louvre')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
  }
  if (l.includes('müze') || l.includes('museum') || l.includes('tarih')) {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'
}

export function getHotelImage(name = '') {
  const n = name.toLowerCase()
  if (n.includes('grand') || n.includes('central')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
  }
  if (n.includes('boutique') || n.includes('spa')) {
    return 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80'
  }
  if (n.includes('residence') || n.includes('point')) {
    return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80'
  }
  return 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80'
}

export function createPlaceMarker(map, place) {
  const category = detectPlaceCategory(place.label)
  const imageUrl = place.image || getPlaceImage(place.label)

  const el = document.createElement('div')
  el.className = `place-marker-node place-marker-${place.id}`

  const inner = document.createElement('div')
  inner.className = 'place-marker-inner'
  inner.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  `

  const badge = document.createElement('div')
  badge.className = 'marker-badge'
  badge.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: #0f172a;
    border: 2px solid ${place.color};
    border-radius: 9999px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    font-size: 11px;
    font-weight: 800;
    color: #ffffff;
    user-select: none;
    white-space: nowrap;
  `
  badge.innerHTML = `
    <span style="display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:${place.color}; font-size:10px; color:#fff;">${place.index + 1}</span>
    <span>${category.icon}</span>
    <span style="font-size:11px; font-weight:600; max-width:110px; overflow:hidden; text-overflow:ellipsis; display:inline-block;">${place.label.split(',')[0]}</span>
  `

  const pinTip = document.createElement('div')
  pinTip.style.cssText = `
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid ${place.color};
    margin-top: -1px;
  `

  inner.appendChild(badge)
  inner.appendChild(pinTip)
  el.appendChild(inner)

  inner.addEventListener('mouseenter', () => {
    inner.style.transform = 'scale(1.18) translateY(-4px)'
    el.style.zIndex = '50'
  })
  inner.addEventListener('mouseleave', () => {
    inner.style.transform = 'scale(1) translateY(0)'
    el.style.zIndex = '1'
  })

  const popup = new mapboxgl.Popup({ offset: 15, closeButton: true, maxWidth: '260px' })
    .setHTML(`
      <div style="
        font-family: system-ui, -apple-system, sans-serif;
        background: #0c1726;
        color: #f8fafc;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 16px 36px rgba(0,0,0,0.7);
        overflow: hidden;
      ">
        <div style="position:relative; width:100%; height:110px; background:#1e293b; overflow:hidden;">
          <img src="${imageUrl}" alt="${place.label}" style="width:100%; height:100%; object-fit:cover;" />
          <span style="position:absolute; top:8px; left:8px; background:${place.color}; color:#fff; border-radius:6px; font-size:10px; font-weight:800; padding:2px 6px;">#${place.index + 1}</span>
          <span style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); color:#fff; border-radius:6px; font-size:10px; font-weight:600; padding:2px 6px;">${category.tag}</span>
        </div>
        <div style="padding:10px 12px;">
          <div style="font-size:13px; font-weight:700; color:#fff; line-height:1.3;">${place.label}</div>
          <div style="font-size:10px; color:#8094b4; margin-top:4px;">${place.lngLat.lat.toFixed(4)}°N, ${place.lngLat.lng.toFixed(4)}°E</div>
          <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <a href="https://www.google.com/maps/search/?api=1&query=${place.lngLat.lat},${place.lngLat.lng}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa; font-size:10px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Google Maps'te Gör <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px;"></i></a>
          </div>
        </div>
      </div>
    `)

  const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat([place.lngLat.lng, place.lngLat.lat])
    .setPopup(popup)
    .addTo(map)

  return marker
}

export function createHotelMarker(map, hotel) {
  const imageUrl = hotel.image || getHotelImage(hotel.name)

  const el = document.createElement('div')
  el.className = 'hotel-marker-node'

  const inner = document.createElement('div')
  inner.className = 'hotel-marker-inner'
  inner.style.cssText = `
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 9px;
    background: #064e3b;
    border: 2px solid #10b981;
    border-radius: 9999px;
    box-shadow: 0 4px 14px rgba(16,185,129,0.5);
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
  `
  inner.innerHTML = `
    <i class="fa-solid fa-hotel" style="color:#6ee7b7; font-size:11px;"></i>
    <span>${hotel.name}</span>
    <span style="background:#10b981; color:#064e3b; font-size:9px; padding:1px 5px; border-radius:4px; font-weight:800; display:inline-flex; align-items:center; gap:2px;">${hotel.rating} <i class="fa-solid fa-star" style="font-size:8px;"></i></span>
  `

  inner.addEventListener('mouseenter', () => {
    inner.style.transform = 'scale(1.15) translateY(-3px)'
    el.style.zIndex = '50'
  })
  inner.addEventListener('mouseleave', () => {
    inner.style.transform = 'scale(1) translateY(0)'
    el.style.zIndex = '1'
  })

  el.appendChild(inner)

  const popup = new mapboxgl.Popup({ offset: 14, closeButton: true, maxWidth: '280px' })
    .setHTML(`
      <div style="
        font-family: system-ui, sans-serif;
        background: #064e3b;
        color: #ecfdf5;
        border-radius: 14px;
        border: 1px solid #10b981;
        box-shadow: 0 16px 36px rgba(0,0,0,0.6);
        overflow: hidden;
      ">
        <div style="position:relative; width:100%; height:110px; background:#022c22; overflow:hidden;">
          <img src="${imageUrl}" alt="${hotel.name}" style="width:100%; height:100%; object-fit:cover;" />
          <span style="position:absolute; top:8px; left:8px; background:#10b981; color:#064e3b; border-radius:6px; font-size:10px; font-weight:800; padding:2px 6px; display:inline-flex; align-items:center; gap:3px;">${hotel.rating} <i class="fa-solid fa-star" style="font-size:8px;"></i> Mükemmel</span>
          <span style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); color:#a7f3d0; border-radius:6px; font-size:11px; font-weight:800; padding:2px 8px;">${hotel.price} / gece</span>
        </div>
        <div style="padding:10px 12px;">
          <div style="font-size:10px; font-weight:800; color:#6ee7b7; text-transform:uppercase;">Optimal Konaklama Noktası</div>
          <div style="font-size:14px; font-weight:700; color:#fff; margin-top:2px;">${hotel.name}</div>
          <div style="font-size:11px; color:#a7f3d0; margin-top:3px;">Sweet Spot merkezine 2-4 dk mesafede</div>
          <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <a href="https://www.google.com/maps/search/hotels/@${hotel.lat},${hotel.lng},16z" target="_blank" rel="noopener noreferrer" style="color:#6ee7b7; font-size:11px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Google Maps'te Gör <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px;"></i></a>
          </div>
        </div>
      </div>
    `)

  const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat([hotel.lng, hotel.lat])
    .setPopup(popup)
    .addTo(map)

  return marker
}

export function flyToLocation(map, lng, lat, zoom = 12) {
  map.flyTo({
    center: [lng, lat],
    zoom,
    speed: 1.4,
    curve: 1.4,
    essential: true,
  })
}

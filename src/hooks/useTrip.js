import { useState, useCallback, useRef } from 'react'
import {
  fetchAllIsochrones,
  addIsochroneLayer,
  removeIsochroneLayers,
  addIntersectionLayer,
  removeIntersectionLayer,
  createPlaceMarker,
  createHotelMarker,
  fetchDirections,
  addRouteLayer,
  removeRouteLayer,
  getGoogleMapsRouteUrl,
  getGoogleMapsRouteWithHotelUrl,
  getPlaceImage,
  getHotelImage,
} from '../services/mapbox'
import {
  calculateSweetSpot,
  calculateArea,
  getPolygonCenter,
  getSweetSpotBounds,
  getPlacesBounds,
} from '../services/isochrone'
import {
  saveTrip as supabaseSaveTrip,
  updateTrip as supabaseUpdateTrip,
  getUserTrips,
  buildShareUrl,
} from '../services/supabase'

const PLACE_COLORS = [
  '#3b82f6',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#6366f1',
]

export function useTrip(map) {
  const [currentTripId, setCurrentTripId] = useState(null)
  const [city, setCity] = useState('')
  const [cityCoords, setCityCoords] = useState(null)

  const [constraints, setConstraints] = useState({ walk: 15, transit: 30 })
  const [places, setPlaces] = useState([])

  const [analyzing, setAnalyzing] = useState(false)
  const [sweetSpot, setSweetSpot] = useState(null)
  const [routeGeometry, setRouteGeometry] = useState(null)

  const [showingHotels, setShowingHotels] = useState(false)
  const hotelMarkersRef = useRef([])

  const [saving, setSaving] = useState(false)
  const [savedTrips, setSavedTrips] = useState([])
  const [tripsLoading, setTripsLoading] = useState(false)

  const [toasts, setToasts] = useState([])
  const markersRef = useRef({})

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const addPlace = useCallback(
    (lngLat, label = '') => {
      if (!map) return

      setPlaces((prev) => {
        if (prev.length >= 20) {
          showToast('Maksimum 20 mekan ekleyebilirsiniz.', 'error')
          return prev
        }

        const newPlace = {
          id: crypto.randomUUID(),
          lngLat,
          label: label || `Mekan ${prev.length + 1}`,
          color: PLACE_COLORS[prev.length % PLACE_COLORS.length],
          index: prev.length,
          openHours: { open: 9, close: 21 },
          busynessLevel: Math.floor(Math.random() * 3) + 1,
        }

        const marker = createPlaceMarker(map, newPlace)
        markersRef.current[newPlace.id] = marker

        map.flyTo({
          center: [lngLat.lng, lngLat.lat],
          zoom: Math.max(map.getZoom(), 13),
          speed: 1.2,
          essential: true,
        })

        return [...prev, newPlace]
      })
    },
    [map, showToast]
  )

  const updatePlaceLabel = useCallback((placeId, newLabel) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, label: newLabel } : p))
    )
  }, [])

  const hoverPlace = useCallback((placeId, isHovered) => {
    const marker = markersRef.current[placeId]
    if (!marker) return
    const el = marker.getElement()
    if (!el) return

    if (isHovered) {
      el.style.zIndex = '100'
      const inner = el.querySelector('.place-marker-inner')
      if (inner) {
        inner.style.transform = 'scale(1.25) translateY(-6px)'
        inner.style.filter = 'drop-shadow(0 0 8px rgba(59,130,246,0.7))'
      }
    } else {
      el.style.zIndex = '1'
      const inner = el.querySelector('.place-marker-inner')
      if (inner) {
        inner.style.transform = 'scale(1) translateY(0)'
        inner.style.filter = ''
      }
    }
  }, [])

  const removePlace = useCallback(
    (placeId) => {
      if (!map) return

      if (markersRef.current[placeId]) {
        markersRef.current[placeId].remove()
        delete markersRef.current[placeId]
      }

      removeIsochroneLayers(map, placeId)

      setPlaces((prev) => {
        const updated = prev.filter((p) => p.id !== placeId)
        return updated.map((p, i) => ({ ...p, index: i }))
      })

      removeIntersectionLayer(map)
      removeRouteLayer(map)
      setRouteGeometry(null)
      setSweetSpot(null)

      hotelMarkersRef.current.forEach((m) => m.remove())
      hotelMarkersRef.current = []
      setShowingHotels(false)
    },
    [map]
  )

  const clearAll = useCallback(() => {
    if (!map) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    places.forEach((p) => removeIsochroneLayers(map, p.id))
    removeIntersectionLayer(map)
    removeRouteLayer(map)
    setRouteGeometry(null)

    hotelMarkersRef.current.forEach((m) => m.remove())
    hotelMarkersRef.current = []
    setShowingHotels(false)

    setPlaces([])
    setSweetSpot(null)
    setCurrentTripId(null)
  }, [map, places])

  const updateConstraints = useCallback((newConstraints) => {
    setConstraints((prev) => ({ ...prev, ...newConstraints }))
  }, [])

  const analyzeIsochrones = useCallback(async () => {
    if (!map || places.length === 0) {
      showToast('Lütfen önce en az bir mekan ekleyin.', 'error')
      return
    }

    setAnalyzing(true)
    removeIntersectionLayer(map)
    removeRouteLayer(map)
    setRouteGeometry(null)
    setSweetSpot(null)
    hotelMarkersRef.current.forEach((m) => m.remove())
    hotelMarkersRef.current = []
    setShowingHotels(false)

    try {
      showToast('İzokronlar hesaplanıyor...', 'info', 10000)

      const isochroneMap = await fetchAllIsochrones(places, constraints)

      for (const place of places) {
        const isoData = isochroneMap.get(place.id)
        if (isoData && !isoData.error) {
          addIsochroneLayer(map, place.id, isoData, place.color)
        }
      }

      if (places.length >= 2) {
        try {
          const profile = constraints.transit > 0 ? 'driving' : 'walking'
          const directions = await fetchDirections(places, profile)
          if (directions) {
            addRouteLayer(map, directions)
            setRouteGeometry(directions)
          }
        } catch (routeErr) {
          console.warn('[Route] Rota çizim hatası:', routeErr)
        }
      }

      const intersection = calculateSweetSpot(isochroneMap, constraints.transit > 0)

      if (intersection) {
        addIntersectionLayer(map, intersection)

        const area = calculateArea(intersection)
        const center = getPolygonCenter(intersection)
        const bounds = getSweetSpotBounds(intersection)

        setSweetSpot({ polygon: intersection, area, center, bounds })

        if (bounds) {
          map.fitBounds(
            [
              [bounds[0], bounds[1]],
              [bounds[2], bounds[3]],
            ],
            { padding: 90, duration: 1500 }
          )
        }

        showToast(
          places.length === 1
            ? `✅ Mekan erişim alanı bulundu! Alan: ${area} km²`
            : `✅ İdeal konaklama bölgesi & gezi rotası hazır! Alan: ${area} km²`,
          'success',
          5000
        )
      } else {
        const placeBounds = getPlacesBounds(places)
        if (placeBounds) {
          map.fitBounds(placeBounds, { padding: 80, duration: 1200 })
        }
        showToast('⚠️ Mekanlar arasında ortak erişilebilir alan bulunamadı. Kısıt sürelerini artırın.', 'error', 8000)
      }
    } catch (err) {
      console.error('[Analysis] İzokron analiz hatası:', err)
      showToast(`Analiz hatası: ${err.message}`, 'error')
    } finally {
      setAnalyzing(false)
    }
  }, [map, places, constraints, showToast])

  const toggleHotels = useCallback(() => {
    if (!map || !sweetSpot?.center) return

    if (showingHotels) {
      hotelMarkersRef.current.forEach((m) => m.remove())
      hotelMarkersRef.current = []
      setShowingHotels(false)
      showToast('Oteller gizlendi.', 'info', 2000)
      return
    }

    const [cLng, cLat] = sweetSpot.center.geometry.coordinates

    const simulatedHotels = [
      {
        name: 'Grand Central Hotel',
        rating: 4.8,
        price: '₺2.400',
        lng: cLng + 0.002,
        lat: cLat + 0.0015,
      },
      {
        name: 'Boutique Suites & Spa',
        rating: 4.6,
        price: '₺1.850',
        lng: cLng - 0.0025,
        lat: cLat + 0.002,
      },
      {
        name: 'City Point Residence',
        rating: 4.9,
        price: '₺3.100',
        lng: cLng + 0.001,
        lat: cLat - 0.0025,
      },
      {
        name: 'Old Town Luxury Inn',
        rating: 4.5,
        price: '₺1.600',
        lng: cLng - 0.0018,
        lat: cLat - 0.0015,
      },
    ]

    const markers = simulatedHotels.map((h) => createHotelMarker(map, h))
    hotelMarkersRef.current = markers
    setShowingHotels(true)
    showToast(`🏨 Yeşil alan içine ${simulatedHotels.length} optimal otel pini eklendi!`, 'success', 4000)
  }, [map, sweetSpot, showingHotels, showToast])

  const saveTrip = useCallback(
    async (title) => {
      if (places.length === 0) {
        showToast('Kaydedilecek mekan yok.', 'error')
        return
      }

      setSaving(true)
      try {
        const mapState = map
          ? {
              center: map.getCenter(),
              zoom: map.getZoom(),
            }
          : {}

        const serializedPlaces = places.map(
          ({ id, lngLat, label, color, index, openHours, busynessLevel }) => ({
            id,
            lngLat,
            label,
            color,
            index,
            openHours,
            busynessLevel,
          })
        )

        let trip
        if (currentTripId) {
          trip = await supabaseUpdateTrip(currentTripId, {
            title,
            city,
            places: serializedPlaces,
            constraints,
            map_state: mapState,
          })
          showToast('✅ Seyahat güncellendi!', 'success')
        } else {
          trip = await supabaseSaveTrip({
            title,
            city,
            places: serializedPlaces,
            constraints,
            mapState,
          })
          setCurrentTripId(trip.id)
          showToast('✅ Seyahat kaydedildi!', 'success')
        }

        return trip
      } catch (err) {
        console.error('[Save] Kayıt hatası:', err)
        showToast(`Kayıt hatası: ${err.message}`, 'error')
      } finally {
        setSaving(false)
      }
    },
    [map, places, constraints, city, currentTripId, showToast]
  )

  const loadSavedTrips = useCallback(async () => {
    setTripsLoading(true)
    try {
      const trips = await getUserTrips()
      setSavedTrips(trips)
    } catch (err) {
      console.error('[Load] Seyahat yükleme hatası:', err)
      showToast('Seyahatler yüklenemedi.', 'error')
    } finally {
      setTripsLoading(false)
    }
  }, [showToast])

  const loadTrip = useCallback(
    (trip) => {
      if (!map) return

      clearAll()

      const loadedPlaces = trip.places || []
      const newMarkers = {}

      loadedPlaces.forEach((place) => {
        const marker = createPlaceMarker(map, place)
        newMarkers[place.id] = marker
      })

      markersRef.current = newMarkers
      setPlaces(loadedPlaces)
      setConstraints(trip.constraints || { walk: 15, transit: 30 })
      setCity(trip.city || '')
      setCurrentTripId(trip.id)

      if (trip.map_state?.center) {
        map.flyTo({
          center: [trip.map_state.center.lng, trip.map_state.center.lat],
          zoom: trip.map_state.zoom || 12,
          speed: 1.2,
        })
      }

      showToast(`"${trip.title}" yüklendi.`, 'success')
    },
    [map, clearAll, showToast]
  )

  const getShareUrl = useCallback((shareId) => {
    return buildShareUrl(shareId)
  }, [])

  return {
    city,
    setCity,
    cityCoords,
    setCityCoords,
    places,
    constraints,
    analyzing,
    sweetSpot,
    routeGeometry,
    googleMapsRouteUrl: getGoogleMapsRouteUrl(places, sweetSpot),
    googleMapsRouteWithHotelUrl: getGoogleMapsRouteWithHotelUrl(places, sweetSpot),
    showingHotels,
    saving,
    savedTrips,
    tripsLoading,
    toasts,
    currentTripId,

    addPlace,
    updatePlaceLabel,
    hoverPlace,
    removePlace,
    clearAll,
    updateConstraints,
    analyzeIsochrones,
    toggleHotels,
    saveTrip,
    loadSavedTrips,
    loadTrip,
    getShareUrl,
    showToast,
  }
}

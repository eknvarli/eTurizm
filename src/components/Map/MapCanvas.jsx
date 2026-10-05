import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { initMap } from '../../services/mapbox'
import MapLegend from './MapLegend'

const MapCanvas = forwardRef(function MapCanvas(
  { addingPlace, onMapClick, onMapLoad, onCancelAdd },
  ref
) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
  }))

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = initMap(containerRef.current)
    mapRef.current = map

    map.on('load', () => {
      setMapLoaded(true)
      onMapLoad?.(map)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }

  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    map.getCanvas().style.cursor = addingPlace ? 'crosshair' : ''

    const handleClick = async (e) => {
      if (!addingPlace) return

      const { lng, lat } = e.lngLat

      let label = ''
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=poi,place,locality,address&access_token=${token}&language=tr`
        )
        const data = await res.json()
        label = data.features?.[0]?.text || data.features?.[0]?.place_name || ''
      } catch {

      }

      onMapClick?.({ lng, lat }, label)
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [addingPlace, mapLoaded, onMapClick])

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">

      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />

      {addingPlace && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-2xl px-5 py-3 flex items-center gap-3.5 shadow-2xl animate-fade-in"
          style={{
            backgroundColor: 'rgba(10, 18, 36, 0.92)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.15)',
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <i className="fa-solid fa-location-dot text-emerald-400"></i> Haritadan Nokta Seçimi
            </span>
            <span className="text-[11px] text-emerald-300">
              Rotana eklemek istediğin bir noktaya tıkla
            </span>
          </div>
          {onCancelAdd && (
            <button
              onClick={onCancelAdd}
              className="ml-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              Vazgeç
            </button>
          )}
        </div>
      )}

      <MapLegend />
    </div>
  )
})

export default MapCanvas

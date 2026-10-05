import { useEffect, useRef } from 'react'
import * as GeocoderNS from '@mapbox/mapbox-gl-geocoder'
import * as mapboxglNS from 'mapbox-gl'

const MapboxGeocoder = GeocoderNS.default ?? GeocoderNS
const mapboxgl = mapboxglNS.default ?? mapboxglNS

export default function CitySearch({ onSelect, onFlyTo }) {
  const containerRef = useRef(null)
  const geocoderRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || geocoderRef.current) return

    const geocoder = new MapboxGeocoder({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      mapboxgl: mapboxgl,
      placeholder: 'Şehir ara (örn: İstanbul, Roma, Paris)...',
      language: 'tr',
      types: 'place,locality,region,country',
      proximity: { longitude: 28.9784, latitude: 41.0082 },
      marker: false,
      flyTo: false,
    })

    geocoder.on('result', (e) => {
      const feature = e.result
      const [lng, lat] = feature.center
      const cityName = feature.text || feature.place_name

      onSelect?.({ city: cityName, center: [lng, lat] })
      onFlyTo?.(lng, lat, feature.bbox ? 11 : 12)
    })

    geocoder.on('clear', () => {
      onSelect?.({ city: '', center: null })
    })

    geocoder.addTo(containerRef.current)
    geocoderRef.current = geocoder

    return () => {
      geocoder.onRemove()
      geocoderRef.current = null
    }

  }, [])

  return (
    <div className="city-search-wrapper w-full">
      <div ref={containerRef} className="w-full" />
    </div>
  )
}

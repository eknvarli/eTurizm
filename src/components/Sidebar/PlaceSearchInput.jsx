import { useState, useEffect, useRef } from 'react'

export default function PlaceSearchInput({ city, onSelectPlace, proximityCoords }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN
        const proximity = proximityCoords
          ? `&proximity=${proximityCoords[0]},${proximityCoords[1]}`
          : ''
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          val
        )}.json?types=poi,place,locality,address&language=tr&limit=6&access_token=${token}${proximity}`

        const res = await fetch(url)
        const data = await res.json()
        if (data.features) {
          setSuggestions(data.features)
          setIsOpen(true)
        }
      } catch (err) {
        console.error('Mekan arama hatası:', err)
      } finally {
        setLoading(false)
      }
    }, 250)
  }

  const handleSelect = (feature) => {
    const [lng, lat] = feature.center
    const label = feature.text || feature.place_name
    onSelectPlace({ lng, lat }, label)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  const getCategoryIconClass = (placeName = '') => {
    const p = placeName.toLowerCase()
    if (p.includes('müze') || p.includes('saray') || p.includes('castle') || p.includes('kale') || p.includes('kule')) return 'fa-solid fa-landmark text-amber-400'
    if (p.includes('cami') || p.includes('kilise') || p.includes('church') || p.includes('mosque')) return 'fa-solid fa-place-of-worship text-emerald-400'
    if (p.includes('park') || p.includes('bahçe') || p.includes('sahil') || p.includes('koru')) return 'fa-solid fa-tree text-green-400'
    if (p.includes('restoran') || p.includes('cafe') || p.includes('kahve') || p.includes('meyhane')) return 'fa-solid fa-utensils text-rose-400'
    if (p.includes('çarşı') || p.includes('pazar') || p.includes('avm')) return 'fa-solid fa-bag-shopping text-purple-400'
    return 'fa-solid fa-location-dot text-blue-400'
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">

        <div className="absolute left-3.5 text-blue-400 pointer-events-none flex items-center justify-center">
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Mekan veya turistik yer ara (örn: Ayasofya)..."
          className="w-full text-xs font-medium text-white placeholder:text-slate-500 outline-none transition-all"
          style={{
            height: '44px',
            paddingLeft: '2.75rem',
            paddingRight: '2.5rem',
            backgroundColor: '#111c2e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.875rem',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)'
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
          }}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setIsOpen(false)
            }}
            className="absolute right-3 text-slate-400 hover:text-white p-1 text-xs rounded-full transition-colors flex items-center justify-center"
            title="Temizle"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fade-in"
          style={{
            backgroundColor: '#0c1726',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="px-3.5 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Önerilen Mekanlar</span>
            <span className="text-blue-400">{suggestions.length} sonuç</span>
          </div>

          {suggestions.map((item) => {
            const iconClass = getCategoryIconClass(item.place_name)
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 border-b border-white/5 last:border-b-0 flex items-start gap-3 transition-colors group"
                style={{ backgroundColor: 'transparent' }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="w-5 h-5 flex items-center justify-center text-sm mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0">
                  <i className={iconClass}></i>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                    {item.text}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.place_name}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  Ekle +
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

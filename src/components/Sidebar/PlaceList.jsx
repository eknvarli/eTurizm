import { useState } from 'react'
import Tooltip from '../UI/Tooltip'
import PlaceSearchInput from './PlaceSearchInput'
import { detectPlaceCategory } from '../../services/mapbox'

function EmptyGuide({ onToggleAdd }) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-white">Rotanı Oluştur</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#4e6285' }}>
            Ziyaret listeni henüz boş
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { step: '1', text: 'Yukarıdaki arama kutusuna mekan adı yaz (Ayasofya, Colosseum...)' },
          { step: '2', text: 'Açılan öneri listesinden mekana tıkla — harita anında odaklanır' },
          { step: '3', text: 'Mekanları ekledikten sonra kısıtları ayarlayıp analizi başlatabilirsin' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-2.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}
            >
              {step}
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: '#4e6285' }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PlaceList({
  places,
  addingPlace,
  analyzing,
  onToggleAdd,
  onRemove,
  onLabelChange,
  onAnalyze,
  onClearAll,
  onAddPlaceDirectly,
  onHoverPlace,
  proximityCoords,
  onNextStep,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')

  const startEdit = (place) => { setEditingId(place.id); setEditingLabel(place.label) }
  const commitEdit = (placeId) => {
    if (editingLabel.trim()) onLabelChange(placeId, editingLabel.trim())
    setEditingId(null)
  }
  const handleKeyDown = (e, placeId) => {
    if (e.key === 'Enter')  commitEdit(placeId)
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div className="space-y-5">

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#4e6285' }}>
            Mekan Ara & Ekle
          </label>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            Otomatik Tamamlama
          </span>
        </div>
        <PlaceSearchInput
          onSelectPlace={(lngLat, label) => onAddPlaceDirectly(lngLat, label)}
          proximityCoords={proximityCoords}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2a3d5c' }}>veya</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <button
        onClick={onToggleAdd}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl text-xs font-semibold transition-all"
        style={addingPlace
          ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }
          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#4e6285' }
        }
      >
        {addingPlace ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Haritaya tıklayın — iptal için tekrar basın</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            <span>Haritadan Tıklayarak İşaretle</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color: '#8094b4' }}>
            Eklenen Mekanlar
          </span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
          >
            {places.length}
          </span>
          <Tooltip content="Fare ile mekanın üzerine gelince haritada anında vurgulanır. İsme tıklayarak düzenleyebilirsin." />
        </div>
        {places.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-semibold transition-colors flex items-center gap-1"
            style={{ color: '#2a3d5c' }}
            onMouseOver={e => e.currentTarget.style.color = '#f87171'}
            onMouseOut={e => e.currentTarget.style.color = '#2a3d5c'}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Tümünü Sil
          </button>
        )}
      </div>

      {places.length === 0 ? (
        <EmptyGuide onToggleAdd={onToggleAdd} />
      ) : (
        <div className="space-y-2 max-h-[30vh] overflow-y-auto -mr-1 pr-1">
          {places.map((place) => {
            const category = detectPlaceCategory(place.label)
            return (
              <div
                key={place.id}
                onMouseEnter={() => onHoverPlace?.(place.id, true)}
                onMouseLeave={() => onHoverPlace?.(place.id, false)}
                className="flex items-center gap-3 rounded-2xl transition-all group"
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
              >

                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                  style={{ backgroundColor: place.color, boxShadow: `0 2px 8px ${place.color}60` }}
                >
                  {place.index + 1}
                </div>

                <span className="w-5 h-5 flex items-center justify-center text-sm flex-shrink-0">
                  <i className={category.iconClass} style={{ color: place.color }}></i>
                </span>

                <div className="flex-1 min-w-0">
                  {editingId === place.id ? (
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onBlur={() => commitEdit(place.id)}
                      onKeyDown={e => handleKeyDown(e, place.id)}
                      className="w-full rounded-lg px-2 py-1 text-xs text-white outline-none"
                      style={{ background: '#0c1726', border: '1px solid rgba(59,130,246,0.5)' }}
                    />
                  ) : (
                    <div>
                      <button
                        onClick={() => startEdit(place)}
                        className="text-xs font-semibold text-left truncate w-full transition-colors"
                        style={{ color: '#c8d8f0' }}
                        title="İsmi düzenlemek için tıkla"
                        onMouseOver={e => e.currentTarget.style.color = '#fff'}
                        onMouseOut={e => e.currentTarget.style.color = '#c8d8f0'}
                      >
                        {place.label}
                      </button>
                      <span className="text-[10px]" style={{ color: '#4e6285' }}>{category.tag}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onRemove(place.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: '#4e6285' }}
                  title="Mekanı kaldır"
                  onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
                  onMouseOut={e => { e.currentTarget.style.color = '#4e6285'; e.currentTarget.style.background = 'transparent' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="pt-1">
        {places.length >= 1 ? (
          <button
            onClick={onNextStep}
            className="btn-primary-action w-full py-3"
          >
            <span>Ulaşım Kısıtlarını Ayarla (Adım 2)</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        ) : (
          <div
            className="p-3.5 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[11px]" style={{ color: '#4e6285' }}>
              Rotaya başlamak için yukarıdaki kutudan ilk mekanını ekle.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

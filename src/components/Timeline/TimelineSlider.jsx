import { useState, useEffect, useCallback } from 'react'
import Tooltip from '../UI/Tooltip'

const START_HOUR = 8
const END_HOUR = 22

export default function TimelineSlider({ places, currentHour, onHourChange }) {
  const [playing, setPlaying] = useState(false)
  const [minimized, setMinimized] = useState(false)

  useEffect(() => {
    if (!playing) return

    const interval = setInterval(() => {
      onHourChange((prev) => {
        const next = prev + 1
        if (next > END_HOUR) {
          setPlaying(false)
          return START_HOUR
        }
        return next
      })
    }, 900)

    return () => clearInterval(interval)
  }, [playing, onHourChange])

  const formatHour = (h) => `${String(h).padStart(2, '0')}:00`

  const getPeriod = (h) => {
    if (h < 12) return { label: 'Sabah', emoji: '🌅' }
    if (h < 17) return { label: 'Öğle', emoji: '☀️' }
    if (h < 20) return { label: 'Akşamüstü', emoji: '🌆' }
    return { label: 'Gece', emoji: '🌙' }
  }

  const period = getPeriod(currentHour)

  const getBusyness = useCallback((place, hour) => {
    const base = place.busynessLevel || 1
    let multiplier = 1
    if (hour >= 10 && hour <= 13) multiplier = 1.5
    else if (hour >= 15 && hour <= 18) multiplier = 2
    else if (hour >= 20) multiplier = 0.4
    return Math.min(3, Math.round(base * multiplier))
  }, [])

  const isOpen = useCallback((place, hour) => {
    const { open = 9, close = 21 } = place.openHours || {}
    return hour >= open && hour < close
  }, [])

  const getBusynessColor = (level) => {
    if (level <= 1) return '#34d399'
    if (level <= 2) return '#fbbf24'
    return '#f87171'
  }

  const getBusynessLabel = (level) => {
    if (level <= 1) return 'Sakin'
    if (level <= 2) return 'Orta'
    return 'Yoğun'
  }

  return (
    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl transition-all">
      <div
        className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl flex flex-col gap-3 transition-all"
        style={{
          backgroundColor: 'rgba(10, 18, 36, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
        }}
      >

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{period.emoji}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Simülasyon Saati: <span className="text-emerald-400 font-extrabold">{formatHour(currentHour)}</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                ({period.label})
              </span>
              <Tooltip content="Günün saatine göre mekanların açılış/kapanış saatlerini ve tahmini turist yoğunluğunu gösterir." />
            </div>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => setPlaying((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              style={{
                backgroundColor: playing ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: playing ? '#fca5a5' : '#93c5fd',
                border: playing ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
              }}
              title={playing ? 'Simülasyonu Durdur' : 'Günü Otomatik Oynat'}
            >
              {playing ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  <span>Durdur</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Oynat</span>
                </>
              )}
            </button>

            <button
              onClick={() => setMinimized((v) => !v)}
              className="text-slate-400 hover:text-white p-1 text-xs rounded-lg transition-colors"
              title="Küçült / Genişlet"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {minimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {!minimized && (
          <>

            <div className="space-y-1.5 px-1">
              <input
                type="range"
                min={START_HOUR}
                max={END_HOUR}
                step={1}
                value={currentHour}
                onChange={(e) => onHourChange(Number(e.target.value))}
                className="timeline-slider w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
                <span>08:00</span>
                <span>11:00</span>
                <span>14:00</span>
                <span>17:00</span>
                <span>20:00</span>
                <span>22:00</span>
              </div>
            </div>

            {places.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin">
                {places.map((place) => {
                  const open = isOpen(place, currentHour)
                  const busy = getBusyness(place, currentHour)

                  return (
                    <div
                      key={place.id}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-all"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: place.color }}
                      />
                      <span className="font-semibold text-slate-200 max-w-[100px] truncate">
                        {place.label}
                      </span>
                      {open ? (
                        <span
                          className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                          style={{
                            color: getBusynessColor(busy),
                            backgroundColor: `${getBusynessColor(busy)}20`,
                          }}
                        >
                          {getBusynessLabel(busy)}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-semibold">Kapalı</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

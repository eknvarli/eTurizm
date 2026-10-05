import { useState } from 'react'

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="absolute top-20 right-3 sm:right-4 z-10 rounded-2xl p-3 shadow-2xl transition-all max-w-[210px]"
      style={{
        backgroundColor: 'rgba(10, 18, 36, 0.88)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#8094b4' }}>
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>Harita Katmanları</span>
        </span>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors"
          style={{
            color: '#94a3b8',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          {collapsed ? 'Aç' : 'Gizle'}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-2 mt-2.5 text-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.3)', border: '1px dashed #3b82f6' }}
            />
            <span className="text-[11px]" style={{ color: '#c8d8f0' }}>Yürüyüş İzokronu</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.25)', border: '1px solid #f59e0b' }}
            />
            <span className="text-[11px]" style={{ color: '#c8d8f0' }}>Toplu Taşıma / Araç</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.4)', border: '1.5px solid #10b981' }}
            />
            <span className="text-[11px] font-bold text-emerald-400">Sweet Spot (Konaklama)</span>
          </div>
        </div>
      )}
    </div>
  )
}

import Tooltip from '../UI/Tooltip'

export default function ConstraintsPanel({
  constraints,
  onChange,
  onAnalyze,
  analyzing,
  placesCount,
  onPrevStep,
}) {
  const handleWalk    = (e) => onChange({ walk: Number(e.target.value) })
  const handleTransit = (e) => onChange({ transit: Number(e.target.value) })

  return (
    <div className="space-y-5">

      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4e6285' }}>
            Adım 2 · Ulaşım Süreleri
          </h3>
          <Tooltip content="Her mekana yürüyerek ve toplu taşımayla en fazla kaç dakika içinde ulaşmak istediğini belirle." />
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: '#2a3d5c' }}>
          Aşağıdaki süreleri ayarla — izokron poligonları bu değerlerle çizilecek.
        </p>
      </div>

      <div
        className="p-4 rounded-2xl space-y-3.5"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <i className="fa-solid fa-person-walking text-blue-400"></i>
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#c8d8f0' }}>Yürüyüş Mesafesi</p>
              <p className="text-[10px]" style={{ color: '#4e6285' }}>Otel → Mekana yaya erişim</p>
            </div>
          </div>
          <div
            className="text-sm font-extrabold px-3 py-1 rounded-xl tabular-nums"
            style={{ background: 'rgba(59,130,246,0.18)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            {constraints.walk} <span className="text-[10px] font-semibold">dk</span>
          </div>
        </div>

        <input
          type="range" min={5} max={45} step={5}
          value={constraints.walk}
          onChange={handleWalk}
          className="w-full"
          title={`Yürüyüş: ${constraints.walk} dakika`}
          style={{ accentColor: '#3b82f6' }}
        />

        <div className="flex justify-between text-[10px] font-medium px-0.5" style={{ color: '#2a3d5c' }}>
          <span>5 dk (yakın)</span>
          <span>25 dk</span>
          <span>45 dk (uzak)</span>
        </div>
      </div>

      <div
        className="p-4 rounded-2xl space-y-3.5"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}
            >
              <i className="fa-solid fa-bus text-amber-400"></i>
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#c8d8f0' }}>Toplu Taşıma / Araç</p>
              <p className="text-[10px]" style={{ color: '#4e6285' }}>Metro, otobüs veya taksi</p>
            </div>
          </div>
          <div
            className="text-sm font-extrabold px-3 py-1 rounded-xl tabular-nums"
            style={
              constraints.transit === 0
                ? { background: 'rgba(100,116,139,0.2)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }
                : { background: 'rgba(245,158,11,0.18)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }
            }
          >
            {constraints.transit === 0
              ? <span className="text-xs font-bold">Kapalı</span>
              : <>{constraints.transit} <span className="text-[10px] font-semibold">dk</span></>
            }
          </div>
        </div>

        <input
          type="range" min={0} max={60} step={5}
          value={constraints.transit}
          onChange={handleTransit}
          className="w-full"
          title={`Toplu taşıma: ${constraints.transit} dakika`}
          style={{ accentColor: '#f59e0b' }}
        />

        <div className="flex justify-between text-[10px] font-medium px-0.5" style={{ color: '#2a3d5c' }}>
          <span>Kapalı (0)</span>
          <span>30 dk</span>
          <span>60 dk</span>
        </div>

        {constraints.transit === 0 && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-[11px]"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}
          >
            <i className="fa-solid fa-triangle-exclamation flex-shrink-0 mt-0.5"></i>
            <span>Toplu taşıma kapalı — sadece yürüyüş erişimi hesaba katılacak.</span>
          </div>
        )}
      </div>

      <div
        className="flex items-start gap-3 p-3.5 rounded-2xl text-[11px]"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <div style={{ color: '#4e6285' }}>
          <p className="font-bold mb-0.5 flex items-center gap-1.5" style={{ color: '#34d399' }}>
            <i className="fa-solid fa-lightbulb text-emerald-400"></i> Püf Nokta
          </p>
          <p className="leading-relaxed">
            Yeşil alan (Sweet Spot) hiç çıkmazsa veya çok darsa, süreleri 5-10 dk artır. Ortak
            erişilebilir bölge genişleyecektir.
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        <button
          onClick={onAnalyze}
          disabled={placesCount < 1 || analyzing}
          className="btn-primary-action w-full py-3.5"
        >
          {analyzing ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              <span>İdeal Bölge Hesaplanıyor…</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>İdeal Konaklama Bölgesini Bul</span>
            </>
          )}
        </button>

        {placesCount < 1 && (
          <p className="text-center text-[11px]" style={{ color: '#2a3d5c' }}>
            Analizi başlatmak için lütfen en az 1 mekan ekleyin
          </p>
        )}

        <button onClick={onPrevStep} className="btn-outline-action w-full py-2.5">
          ← Mekan Listesine Dön
        </button>
      </div>
    </div>
  )
}

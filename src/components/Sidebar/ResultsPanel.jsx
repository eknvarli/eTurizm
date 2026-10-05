import Tooltip from '../UI/Tooltip'

function WaitingGuide({ onResetFlow }) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div
        className="p-5 rounded-2xl space-y-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.09)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Analiz Henüz Yapılmadı</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#4e6285' }}>
              Sonuçlar burada görünecek
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            {
              icon: (
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              ),
              text: "1. Adım'dan mekanlarını ekle",
              done: false,
            },
            {
              icon: (
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              text: "2. Adım'dan ulaşım sürelerini ayarla",
              done: false,
            },
            {
              icon: (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              text: '"İdeal Konaklama Bölgesini Bul" butonuna bas',
              done: false,
            },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {icon}
              </div>
              <p className="text-[11px]" style={{ color: '#4e6285' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-2xl space-y-2"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
      >
        <p className="text-xs font-bold" style={{ color: '#60a5fa' }}>📐 İzokron & Harita Rotası Nedir?</p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#4e6285' }}>
          Belirli bir noktadan belirli sürede ulaşılabilecek sınırları çizer. Analiz başlatıldığında
          eklediğiniz konumlar arasında haritada görsel rota oluşturulur ve tüm mekanlara ortak erişim
          sağlayan ideal otel bölgesi (Sweet Spot) hesaplanır.
        </p>
      </div>

      <button onClick={onResetFlow} className="btn-primary-action w-full py-3">
        1. Adıma Git — Mekan Ekle
      </button>
    </div>
  )
}

export default function ResultsPanel({
  sweetSpot,
  places,
  constraints,
  city,
  routeGeometry,
  googleMapsRouteUrl,
  googleMapsRouteWithHotelUrl,
  onFlyToSweetSpot,
  onToggleHotels,
  showingHotels,
  onResetFlow,
}) {
  if (!sweetSpot) return <WaitingGuide onResetFlow={onResetFlow} />

  const centerCoords = sweetSpot.center?.geometry?.coordinates
  const lat = centerCoords ? centerCoords[1].toFixed(4) : null
  const lng = centerCoords ? centerCoords[0].toFixed(4) : null

  const googleMapsUrl = `https://www.google.com/maps/search/hotels/@${lat},${lng},15z`
  const bookingUrl    = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city || 'Otel')}&latitude=${lat}&longitude=${lng}`

  return (
    <div className="space-y-4 animate-fade-in">

      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#4e6285' }}>
          İdeal Bölge & Gezi Rotası
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            Sweet Spot Hazır
          </span>
        </div>
      </div>

      <div
        className="p-4 rounded-2xl space-y-4"
        style={{
          background: 'linear-gradient(145deg, rgba(6,78,59,0.25) 0%, rgba(5,150,105,0.1) 100%)',
          border: '1px solid rgba(16,185,129,0.3)',
          boxShadow: '0 8px 32px rgba(16,185,129,0.1)',
        }}
      >

        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#34d399' }}>
              Ortak Erişim Alanı
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-white tabular-nums">{sweetSpot.area}</span>
              <span className="text-xs font-semibold" style={{ color: '#34d399' }}>km²</span>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            🏨
          </div>
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: '#6ee7b7' }}>
          {places.length === 1 ? (
            <>
              Bu yeşil alan, seçtiğin <strong className="text-white">{places[0]?.label}</strong> için
              maksimum <strong className="text-white">{constraints.walk} dk</strong> yürüyüş
              {constraints.transit > 0 && <> ya da <strong className="text-white">{constraints.transit} dk</strong> toplu taşıma</>} mesafesindeki konaklama bölgesidir.
            </>
          ) : (
            <>
              Bu yeşil bölgede konaklamak, rotandaki {places.length} mekanın tümüne
              maksimum <strong className="text-white">{constraints.walk} dk</strong> yürüyüş
              {constraints.transit > 0 && <> ya da <strong className="text-white">{constraints.transit} dk</strong> transit</>} ile ulaşım imkânı sağlar.
            </>
          )}
        </p>

        {places.length >= 2 && (
          <div
            className="flex items-center gap-2 p-2.5 rounded-xl text-[11px]"
            style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#7dd3fc' }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />
            <span>Mekanlar arasındaki gezi rotası haritada mavi kesikli çizgiyle gösterildi.</span>
          </div>
        )}

        <button
          onClick={onToggleHotels}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2.5"
          style={showingHotels
            ? { background: '#059669', color: '#fff', border: '1px solid #10b981', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }
            : { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
          }
        >
          <span>🏨</span>
          <span>{showingHotels ? 'Otel Pinlerini Haritadan Kaldır' : 'Bu Bölgedeki Otelleri Haritada Gör'}</span>
        </button>

        <button
          onClick={onFlyToSweetSpot}
          className="w-full btn-outline-action py-2.5 text-xs"
          style={{ color: '#34d399', borderColor: 'rgba(16,185,129,0.2)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Yeşil Alana Haritada Odaklan
        </button>
      </div>

      <div className="space-y-2 pt-1">
        <a
          href={googleMapsRouteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 text-white shadow-xl group"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
          }}
        >
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="truncate">
            {places.length > 1 ? "Gezi Rotasını Google Maps'te Aç" : "Google Maps'te Konuma Git"}
          </span>
          <svg className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {sweetSpot?.center && places.length > 1 && (
          <a
            href={googleMapsRouteWithHotelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-outline-action py-2.5 text-xs flex items-center justify-center gap-2"
            style={{ color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.25)' }}
          >
            <span>🏨</span>
            <span className="truncate">Otelden Başlayan Rotayı Google Maps'te Aç</span>
            <span>↗</span>
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: 'Optimal Enlem', value: lat ? `${lat}° N` : '—' },
          { label: 'Optimal Boylam', value: lng ? `${lng}° E` : '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-3 rounded-xl space-y-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#2a3d5c' }}>{label}</p>
            <p className="text-xs font-bold tabular-nums" style={{ color: '#8094b4' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-bold" style={{ color: '#4e6285' }}>Otel Fiyat & Rezervasyon</p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1.5 p-3.5 rounded-2xl transition-all group"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold" style={{ color: '#60a5fa' }}>Booking.com</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#60a5fa' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-[10px]" style={{ color: '#2a3d5c' }}>Bu bölgedeki otelleri filtrele</p>
          </a>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1.5 p-3.5 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold" style={{ color: '#c8d8f0' }}>Google Maps Oteller</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#4e6285' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-[10px]" style={{ color: '#2a3d5c' }}>Fiyat ve yorumları incele</p>
          </a>
        </div>
      </div>

      <button onClick={onResetFlow} className="btn-outline-action w-full py-2.5 text-xs">
        ← Yeni Rota Oluştur
      </button>
    </div>
  )
}

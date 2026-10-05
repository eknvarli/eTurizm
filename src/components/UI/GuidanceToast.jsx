import { useState } from 'react'

export default function GuidanceToast({
  placesCount,
  analyzing,
  hasSweetSpot,
  addingPlace,
  onStartTour,
  onDismiss,
}) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const getGuidance = () => {
    if (analyzing) {
      return {
        badge: 'Hesaplanıyor',
        badgeColor: 'rgba(168, 85, 247, 0.2)',
        badgeBorder: 'rgba(168, 85, 247, 0.4)',
        textColor: '#d8b4fe',
        title: 'İzokronlar Kesiştiriliyor ⏳',
        message: 'Mekanların yürüyüş ve toplu taşıma erişilebilirlik poligonları hesaplanıp ortak alan kesiştiriliyor...',
        icon: (
          <svg className="w-5 h-5 text-purple-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
        ),
      }
    }

    if (hasSweetSpot) {
      return {
        badge: 'Sonuç Hazır',
        badgeColor: 'rgba(16, 185, 129, 0.2)',
        badgeBorder: 'rgba(16, 185, 129, 0.4)',
        textColor: '#34d399',
        title: 'İdeal Konaklama Bölgesi Bulundu ✨',
        message: 'Haritada parlayan yeşil poligon, tüm mekanlarına belirlediğin sürelerde ulaşabileceğin en ideal otel bölgesidir.',
        icon: (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      }
    }

    if (addingPlace) {
      return {
        badge: 'Haritadan Seçim',
        badgeColor: 'rgba(59, 130, 246, 0.2)',
        badgeBorder: 'rgba(59, 130, 246, 0.4)',
        textColor: '#60a5fa',
        title: 'Haritada Bir Noktaya Tıkla 📍',
        message: 'Ziyaret etmek istediğin bir yeri harita üzerinden doğrudan tıklayarak listene ekleyebilirsin.',
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      }
    }

    if (placesCount === 0) {
      return {
        badge: '1. Adım',
        badgeColor: 'rgba(59, 130, 246, 0.2)',
        badgeBorder: 'rgba(59, 130, 246, 0.4)',
        textColor: '#60a5fa',
        title: 'İlk Mekanını Ekle 🚀',
        message: 'Sol paneldeki arama kutusuna mekan adı yazarak rotana ekle (örn: Ayasofya, Sultanahmet vb.).',
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
      }
    }

    if (placesCount === 1) {
      return {
        badge: 'Analize Hazır',
        badgeColor: 'rgba(59, 130, 246, 0.2)',
        badgeBorder: 'rgba(59, 130, 246, 0.4)',
        textColor: '#60a5fa',
        title: 'Mekan Eklendi 🎯',
        message: 'İster hemen analizi başlatıp çevresindeki konaklama bölgesini bulabilir, istersen rota oluşturmak için yeni duraklar ekleyebilirsin.',
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      }
    }

    return {
      badge: 'Rota & Analiz Hazır',
      badgeColor: 'rgba(16, 185, 129, 0.2)',
      badgeBorder: 'rgba(16, 185, 129, 0.4)',
      textColor: '#34d399',
      title: 'Gezi Rotası ve İdeal Bölge ⚡',
      message: '"İdeal Konaklama Bölgesini Bul" butonuna basarak mekanlar arası rotayı ve en optimum otel bölgesini haritada keşfet.',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    }
  }

  const guide = getGuidance()

  return (
    <div className="absolute top-4 left-4 z-20 max-w-sm w-[calc(100%-2rem)] sm:w-84 animate-fade-in pointer-events-auto">
      <div
        className="p-4 rounded-2xl shadow-2xl flex items-start gap-3.5 transition-all"
        style={{
          backgroundColor: 'rgba(10, 18, 36, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
        }}
      >

        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {guide.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: guide.badgeColor,
                border: `1px solid ${guide.badgeBorder}`,
                color: guide.textColor,
              }}
            >
              {guide.badge}
            </span>
            <span className="text-xs font-bold text-white truncate">
              {guide.title}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: '#8094b4' }}>
            {guide.message}
          </p>

          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5">
            {onStartTour && (
              <button
                onClick={onStartTour}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <span>Rehberi Aç</span>
                <span>→</span>
              </button>
            )}
            <button
              onClick={() => {
                setDismissed(true)
                onDismiss?.()
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors ml-auto"
            >
              Anladım
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setDismissed(true)
            onDismiss?.()
          }}
          className="text-slate-500 hover:text-slate-300 -mr-1 -mt-1 p-1 rounded-lg transition-colors"
          aria-label="Kapat"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

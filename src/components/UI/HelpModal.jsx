import { useState } from 'react'

const LS_KEY = 'eturizm_show_help_on_start'

export function getShowHelpOnStart() {
  try {
    const val = localStorage.getItem(LS_KEY)
    return val === null ? true : val === 'true'
  } catch {
    return true
  }
}

export default function HelpModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0)
  const [showOnStartup, setShowOnStartup] = useState(() => getShowHelpOnStart())

  if (!isOpen) return null

  const handleClose = () => {
    try {
      localStorage.setItem(LS_KEY, String(showOnStartup))
    } catch {}
    onClose(showOnStartup)
  }

  const steps = [
    {
      title: '1. Şehir veya Bölgenizi Belirleyin',
      badge: 'Başlangıç',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      desc: 'Sol paneldeki arama kutusuna seyahat edeceğiniz şehri yazın veya haritayı doğrudan sürükleyerek dilediğiniz destinasyona odaklanın.',
      tip: 'İpucu: İstanbul, Roma, Barselona veya Tokyo gibi tüm dünya şehirlerini arayabilirsiniz.',
    },
    {
      title: '2. Gezilecek Mekanları İşaretleyin',
      badge: 'Mekan Ekle',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      desc: 'Sol menüden mekan arayın veya haritadan tıklayarak ziyaret etmek istediğiniz müze, tarihi meydan ve turistik durakları rotanıza ekleyin.',
      tip: 'İpucu: Tek bir mekan ekleyerek onun çevresindeki otelleri bulabilir veya çoklu mekan ekleyerek aralarında gezi rotası oluşturabilirsiniz.',
    },
    {
      title: '3. Ulaşım Kısıtlarınızı Tanımlayın',
      badge: 'Erişilebilirlik',
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      desc: '"Kısıtlar" sekmesinden yürüyerek ve toplu taşımayla mekanlara maksimum kaç dakika mesafede olmak istediğinizi belirleyin.',
      tip: 'İpucu: 15 dakika yürüyüş ve 30 dakika toplu taşıma dengeli bir seyahat başlangıcı sunar.',
    },
    {
      title: '4. Gezi Rotasını ve İdeal Otel Bölgesini Keşfedin',
      badge: 'Sweet Spot & Rota',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      desc: '"İdeal Konaklama Bölgesini Bul" butonuna bastığınızda mekanlar arası gerçek gezi rotası çizilir, izokronlar kesiştirilir ve ideal otel bölgesi (Sweet Spot) hesaplanır. Tek tıkla rotayı Google Maps üzerinde açıp navigasyonu başlatabilirsiniz.',
      tip: 'İpucu: Otelinizi bu yeşil alan içinde seçerek seyahatiniz boyunca yol stresinden ve zaman kaybından kurtulun!',
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              eTurizm Nasıl Çalışır?
            </h2>
            <p className="text-xs text-slate-400">
              İzokron tabanlı akıllı seyahat ve konaklama rehberi
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-5 border-b border-slate-800 pb-3">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center truncate ${
                activeStep === idx
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx + 1}. Adım
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                {steps[activeStep].icon}
              </div>
              <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {steps[activeStep].badge}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {steps[activeStep].title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {steps[activeStep].desc}
            </p>

            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">💡</span>
              <span>{steps[activeStep].tip}</span>
            </div>

            {activeStep === 3 && (
              <label className="flex items-center gap-2.5 mt-1 cursor-pointer group select-none">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={showOnStartup}
                    onChange={(e) => {
                      const next = e.target.checked
                      setShowOnStartup(next)
                      try { localStorage.setItem(LS_KEY, String(next)) } catch {}
                    }}
                    className="sr-only peer"
                  />

                  <div
                    className="w-4 h-4 rounded border transition-all flex items-center justify-center"
                    style={{
                      backgroundColor: showOnStartup ? '#3b82f6' : 'transparent',
                      borderColor: showOnStartup ? '#3b82f6' : 'rgba(100,116,139,0.6)',
                    }}
                  >
                    {showOnStartup && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-tight">
                  Açılışta tekrar göster
                </span>
              </label>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-300 flex items-center gap-1.5">
              <span>📐</span> İzokron (Isochrone) Nedir?
            </p>
            <p className="text-[11px] leading-relaxed">
              Seçilen bir noktadan belirli bir süre zarfında (örneğin 15 dakika yürüyüş) ulaşılabilecek coğrafi sınırları çizen erişilebilirlik haritasıdır.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="btn-outline-action text-xs px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Önceki
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="btn-primary-action text-xs px-5 py-2"
            >
              Sonraki →
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="btn-primary-action text-xs px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400"
            >
              Hemen Başla 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

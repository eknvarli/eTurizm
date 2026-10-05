import { useState } from 'react'
import { buildShareUrl } from '../../services/supabase'

export default function TripActions({
  isAuthenticated,
  userInfo,
  onSignIn,
  saving,
  onSave,
  savedTrips,
  tripsLoading,
  onLoadTrips,
  onSelectTrip,
  currentTripId,
  placesCount,
}) {
  const [showTrips, setShowTrips] = useState(false)
  const [tripTitle, setTripTitle] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const handleShowTrips = async () => {
    if (!showTrips) {
      await onLoadTrips()
    }
    setShowTrips((v) => !v)
  }

  const handleSave = async () => {
    if (!tripTitle.trim()) return
    await onSave(tripTitle.trim())
    setShowSaveForm(false)
    setTripTitle('')
  }

  const copyShareLink = async (shareId, tripId) => {
    const url = buildShareUrl(shareId)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(tripId)
      setTimeout(() => setCopiedId(null), 2500)
    } catch {
      window.prompt('Paylaşım bağlantısını kopyalayın:', url)
    }
  }

  if (!isAuthenticated) {
    return (
      <div
        className="p-4 rounded-2xl space-y-3 text-center"
        style={{
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-blue-400"
            style={{ background: 'rgba(59, 130, 246, 0.15)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h4 className="text-xs font-bold text-white">Rotayı Buluta Kaydet</h4>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Google hesabınla oturum açarak seyahat planlarını kaydedebilir ve arkadaşlarınla paylaşabileceğin benzersiz linkler oluşturabilirsin.
        </p>
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Google ile Giriş Yap</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowSaveForm((v) => !v)}
          disabled={placesCount === 0 || saving}
          className="btn-primary-action py-2.5 px-3 text-xs w-full"
        >
          {saving ? (
            'Kaydediliyor...'
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{currentTripId ? 'Güncelle' : 'Planı Kaydet'}</span>
            </>
          )}
        </button>

        <button
          onClick={handleShowTrips}
          className="btn-outline-action py-2.5 px-3 text-xs w-full justify-between"
        >
          <span className="flex items-center gap-1.5 truncate">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
            <span>Kayıtlı Rotalar</span>
          </span>
          {savedTrips.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#60a5fa' }}
            >
              {savedTrips.length}
            </span>
          )}
        </button>
      </div>

      {showSaveForm && (
        <div
          className="p-3.5 rounded-2xl space-y-2.5 animate-fade-in shadow-xl"
          style={{
            backgroundColor: '#0c1726',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-white uppercase tracking-wider">
              Seyahat Planı Adı
            </label>
            <span className="text-[10px] text-slate-400">{placesCount} mekan seçili</span>
          </div>
          <input
            type="text"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Örn: Hafta Sonu Roma Gezisi"
            className="w-full rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
            style={{
              backgroundColor: '#111c2e',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!tripTitle.trim()}
              className="btn-primary-action flex-1 py-2 text-xs"
            >
              Onayla & Kaydet
            </button>
            <button
              onClick={() => setShowSaveForm(false)}
              className="btn-outline-action flex-1 py-2 text-xs"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {showTrips && (
        <div
          className="p-3.5 rounded-2xl space-y-2 animate-fade-in shadow-xl"
          style={{
            backgroundColor: '#0c1726',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Kayıtlı Rotaların
            </span>
            <button
              onClick={onLoadTrips}
              className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-semibold"
              disabled={tripsLoading}
            >
              {tripsLoading ? 'Yükleniyor...' : 'Yenile'}
            </button>
          </div>

          {tripsLoading ? (
            <p className="text-center text-xs text-slate-400 py-3">Buluttan çekiliyor...</p>
          ) : savedTrips.length === 0 ? (
            <div className="text-center py-4 text-slate-400 space-y-1">
              <p className="text-xs font-semibold">Henüz kayıtlı seyahatin yok.</p>
              <p className="text-[10px] text-slate-500">Mekanlar ekleyip "Planı Kaydet"e basarak ilk rotanı saklayabilirsin.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {savedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    trip.id === currentTripId
                      ? 'bg-blue-600/20 border-blue-500/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{trip.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {trip.city || 'Şehir belirtilmedi'} • {trip.places?.length || 0} mekan
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">

                    <button
                      onClick={() => onSelectTrip(trip)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold transition-colors"
                      title="Seyahati haritaya yükle"
                    >
                      Aç
                    </button>

                    {trip.share_id && (
                      <button
                        onClick={() => copyShareLink(trip.share_id, trip.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Paylaşım linkini kopyala"
                      >
                        {copiedId === trip.id ? (
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

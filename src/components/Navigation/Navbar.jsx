export default function Navbar({
  city,
  placesCount,
  onOpenHelp,
  onToggleSidebar,
  sidebarOpen,
  isAuthenticated,
  userInfo,
  onSignIn,
  onSignOut,
}) {
  return (
    <header
      className="h-14 sm:h-[60px] w-full flex items-center justify-between px-4 sm:px-6 z-30 relative"
      style={{
        background: 'rgba(6, 13, 26, 0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >

      <div className="flex items-center gap-3">

        <button
          onClick={onToggleSidebar}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
          aria-label="Paneli aç/kapat"
        >
          <svg className="w-4.5 h-4.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
            }}
          >
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] tracking-tight text-white">eTurizm</span>
              <span
                className="hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
              >
                BETA
              </span>
            </div>
            <span className="hidden sm:block text-[11px] font-medium" style={{ color: '#4e6285' }}>
              Isochrone Trip Planner
            </span>
          </div>
        </div>

        {city && (
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-white">{city}</span>
            {placesCount > 0 && (
              <>
                <span style={{ color: '#1e3050' }}>•</span>
                <span style={{ color: '#4e6285' }}>{placesCount} mekan</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">

        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 rounded-xl transition-all text-xs font-semibold"
          style={{
            padding: '7px 14px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
            color: '#60a5fa',
          }}
          title="Uygulama kullanım rehberi"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Nasıl Kullanılır?</span>
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-2" style={{ paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            {userInfo?.avatar ? (
              <img
                src={userInfo.avatar}
                alt={userInfo.name}
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: '2px solid rgba(59,130,246,0.4)' }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-blue-300"
                style={{ background: 'rgba(59,130,246,0.2)', border: '2px solid rgba(59,130,246,0.3)' }}
              >
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-semibold text-white">{userInfo?.name?.split(' ')[0]}</span>
              <span className="text-[10px]" style={{ color: '#4e6285' }}>Oturum Açık</span>
            </div>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#4e6285' }}
              title="Çıkış Yap"
              onMouseOver={e => e.currentTarget.style.color = '#f87171'}
              onMouseOut={e => e.currentTarget.style.color = '#4e6285'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center gap-2 rounded-xl text-slate-900 text-xs font-bold transition-all active:scale-95"
            style={{
              padding: '7px 14px',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google ile Giriş</span>
          </button>
        )}
      </div>
    </header>
  )
}

import { useState } from 'react'
import CitySearch from './CitySearch'
import ConstraintsPanel from './ConstraintsPanel'
import PlaceList from './PlaceList'
import ResultsPanel from './ResultsPanel'
import TripActions from './TripActions'

const TABS = [
  { key: 'places',      label: '1 · Mekanlar',    short: '1' },
  { key: 'constraints', label: '2 · Kısıtlar',     short: '2' },
  { key: 'results',     label: '3 · İdeal Bölge',  short: '3' },
]

export default function Sidebar({
  isAuthenticated,
  userInfo,
  onSignIn,
  onSignOut,
  onCitySelect,
  onFlyTo,
  onFlyToSweetSpot,
  city,
  cityCoords,
  places,
  constraints,
  addingPlace,
  analyzing,
  sweetSpot,
  routeGeometry,
  googleMapsRouteUrl,
  googleMapsRouteWithHotelUrl,
  showingHotels,
  saving,
  savedTrips,
  tripsLoading,
  currentTripId,
  onToggleAdd,
  onRemovePlace,
  onLabelChange,
  onHoverPlace,
  onAnalyze,
  onToggleHotels,
  onClearAll,
  onAddPlaceDirectly,
  onConstraintsChange,
  onSave,
  onLoadTrips,
  onSelectTrip,
  isOpen,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('places')

  return (
    <>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 sm:hidden transition-opacity"
          style={{ background: 'rgba(6,13,26,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed sm:static bottom-0 left-0 right-0 sm:right-auto
          z-40 sm:z-20
          w-full sm:w-[380px] md:w-[400px]
          max-h-[88vh] sm:max-h-none h-auto sm:h-full
          flex flex-col
          rounded-t-[1.5rem] sm:rounded-none
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-0'}
        `}
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >

        <div className="w-full flex justify-center pt-3 pb-2 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div
          className="px-5 pt-4 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(59,130,246,0.18)' }}
              >
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#4e6285' }}>
                Destinasyon
              </span>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden text-xs px-2.5 py-1 rounded-lg transition-colors"
              style={{ color: '#4e6285', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Kapat
            </button>
          </div>

          <CitySearch onSelect={onCitySelect} onFlyTo={onFlyTo} />

          {!city && (
            <p className="mt-2.5 text-[11px] flex items-center gap-1.5" style={{ color: '#4e6285' }}>
              <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              İstanbul, Roma veya herhangi bir şehir yazın
            </p>
          )}
        </div>

        <div
          className="px-5 pt-3.5 pb-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key
              const hasResult = tab.key === 'results' && sweetSpot
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative flex-1 py-2 px-1 text-[11px] font-bold rounded-xl transition-all truncate"
                  style={isActive
                    ? {
                        background: tab.key === 'results'
                          ? 'linear-gradient(135deg, #059669, #10b981)'
                          : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                        color: '#fff',
                        boxShadow: tab.key === 'results'
                          ? '0 4px 12px rgba(16,185,129,0.35)'
                          : '0 4px 12px rgba(37,99,235,0.35)',
                      }
                    : { color: '#4e6285' }
                  }
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  {tab.key === 'places' && places.length > 0 && (
                    <span
                      className="absolute top-1 right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                      style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(59,130,246,0.3)', color: isActive ? '#fff' : '#60a5fa' }}
                    >
                      {places.length}
                    </span>
                  )}
                  {hasResult && !isActive && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ minHeight: 0 }}>
          {activeTab === 'places' && (
            <PlaceList
              places={places}
              addingPlace={addingPlace}
              analyzing={analyzing}
              onToggleAdd={onToggleAdd}
              onRemove={onRemovePlace}
              onLabelChange={onLabelChange}
              onHoverPlace={onHoverPlace}
              onAddPlaceDirectly={onAddPlaceDirectly}
              proximityCoords={cityCoords}
              onAnalyze={() => { onAnalyze(); setActiveTab('results') }}
              onClearAll={onClearAll}
              onNextStep={() => setActiveTab('constraints')}
            />
          )}

          {activeTab === 'constraints' && (
            <ConstraintsPanel
              constraints={constraints}
              onChange={onConstraintsChange}
              placesCount={places.length}
              analyzing={analyzing}
              onAnalyze={() => { onAnalyze(); setActiveTab('results') }}
              onPrevStep={() => setActiveTab('places')}
            />
          )}

          {activeTab === 'results' && (
            <ResultsPanel
              sweetSpot={sweetSpot}
              places={places}
              constraints={constraints}
              city={city}
              routeGeometry={routeGeometry}
              googleMapsRouteUrl={googleMapsRouteUrl}
              googleMapsRouteWithHotelUrl={googleMapsRouteWithHotelUrl}
              onFlyToSweetSpot={onFlyToSweetSpot}
              onToggleHotels={onToggleHotels}
              showingHotels={showingHotels}
              onResetFlow={() => setActiveTab('places')}
            />
          )}
        </div>

        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,13,26,0.4)' }}
        >
          <TripActions
            isAuthenticated={isAuthenticated}
            userInfo={userInfo}
            onSignIn={onSignIn}
            saving={saving}
            onSave={onSave}
            savedTrips={savedTrips}
            tripsLoading={tripsLoading}
            onLoadTrips={onLoadTrips}
            onSelectTrip={onSelectTrip}
            currentTripId={currentTripId}
            placesCount={places.length}
          />
        </div>
      </aside>
    </>
  )
}

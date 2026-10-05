import { useState, useCallback, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTrip } from './hooks/useTrip'
import Navbar from './components/Navigation/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import MapCanvas from './components/Map/MapCanvas'
import TimelineSlider from './components/Timeline/TimelineSlider'
import ToastContainer from './components/UI/ToastContainer'
import LoadingScreen from './components/UI/LoadingScreen'
import HelpModal from './components/UI/HelpModal'
import GuidanceToast from './components/UI/GuidanceToast'
import { flyToLocation } from './services/mapbox'

export default function App() {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  const [addingPlace, setAddingPlace] = useState(false)
  const [currentHour, setCurrentHour] = useState(10)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const {
    user,
    loading: authLoading,
    isAuthenticated,
    userInfo,
    signIn,
    signOut,
  } = useAuth()

  const trip = useTrip(map)

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
  }, [])

  const toggleAddingPlace = useCallback(() => {
    setAddingPlace((v) => !v)
    if (!addingPlace) {
      setSidebarOpen(false)
    }
  }, [addingPlace])

  const handleMapClick = useCallback(
    (lngLat, label) => {
      trip.addPlace(lngLat, label)
      setAddingPlace(false)
      setSidebarOpen(true)
    },
    [trip]
  )

  const handleCitySelect = useCallback(
    ({ city, center }) => {
      trip.setCity(city)
      if (center) {
        trip.setCityCoords(center)
      }
    },
    [trip]
  )

  const handleFlyTo = useCallback(
    (lng, lat, zoom = 12) => {
      if (map) flyToLocation(map, lng, lat, zoom)
    },
    [map]
  )

  const handleFlyToSweetSpot = useCallback(() => {
    if (!map || !trip.sweetSpot?.bounds) return
    const [minLng, minLat, maxLng, maxLat] = trip.sweetSpot.bounds
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 100, duration: 1500 }
    )
  }, [map, trip.sweetSpot])

  if (authLoading) return <LoadingScreen />

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans select-none">

      <Navbar
        city={trip.city}
        placesCount={trip.places.length}
        onOpenHelp={() => setHelpOpen(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        isAuthenticated={isAuthenticated}
        userInfo={userInfo}
        onSignIn={signIn}
        onSignOut={signOut}
      />

      <div className="flex flex-1 relative overflow-hidden">

        <Sidebar
          isAuthenticated={isAuthenticated}
          userInfo={userInfo}
          onSignIn={signIn}
          onSignOut={signOut}
          onCitySelect={handleCitySelect}
          onFlyTo={handleFlyTo}
          onFlyToSweetSpot={handleFlyToSweetSpot}
          city={trip.city}
          cityCoords={trip.cityCoords}
          places={trip.places}
          constraints={trip.constraints}
          addingPlace={addingPlace}
          analyzing={trip.analyzing}
          sweetSpot={trip.sweetSpot}
          routeGeometry={trip.routeGeometry}
          googleMapsRouteUrl={trip.googleMapsRouteUrl}
          googleMapsRouteWithHotelUrl={trip.googleMapsRouteWithHotelUrl}
          showingHotels={trip.showingHotels}
          saving={trip.saving}
          savedTrips={trip.savedTrips}
          tripsLoading={trip.tripsLoading}
          currentTripId={trip.currentTripId}
          onToggleAdd={toggleAddingPlace}
          onRemovePlace={trip.removePlace}
          onLabelChange={trip.updatePlaceLabel}
          onHoverPlace={trip.hoverPlace}
          onAddPlaceDirectly={(lngLat, label) => trip.addPlace(lngLat, label)}
          onAnalyze={trip.analyzeIsochrones}
          onToggleHotels={trip.toggleHotels}
          onClearAll={trip.clearAll}
          onConstraintsChange={trip.updateConstraints}
          onSave={trip.saveTrip}
          onLoadTrips={trip.loadSavedTrips}
          onSelectTrip={trip.loadTrip}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 relative w-full h-full">
          <MapCanvas
            ref={mapRef}
            addingPlace={addingPlace}
            onMapClick={handleMapClick}
            onMapLoad={handleMapLoad}
            onCancelAdd={() => setAddingPlace(false)}
          />

          <GuidanceToast
            placesCount={trip.places.length}
            analyzing={trip.analyzing}
            hasSweetSpot={!!trip.sweetSpot}
            addingPlace={addingPlace}
            onStartTour={() => setHelpOpen(true)}
          />

          <TimelineSlider
            places={trip.places}
            currentHour={currentHour}
            onHourChange={setCurrentHour}
          />

          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="sm:hidden absolute top-4 left-4 z-20 bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-white shadow-2xl active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Paneli Aç ({trip.places.length})</span>
            </button>
          )}
        </main>
      </div>

      <ToastContainer toasts={trip.toasts} />

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

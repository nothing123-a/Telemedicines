'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, Navigation, Star } from 'lucide-react';

export default function PhysicalPharmacy() {
  const [location, setLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [watchId, setWatchId] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      loadGoogleMaps();
    }
  }, [location]);

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }
    
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          initializeMap();
        }
      }, 100);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ';
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !location) return;
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: location,
      zoom: 14,
      backgroundColor: 'transparent',
      disableDefaultUI: false,
      gestureHandling: 'greedy',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    mapInstanceRef.current = map;
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: '#3B82F6',
        strokeWeight: 4
      },
      suppressMarkers: false
    });
    directionsRendererRef.current.setMap(map);
    
    // Add current location marker immediately
    addCurrentLocationMarker(location);
    
    // Enable pointer events for interactive elements
    mapRef.current.style.pointerEvents = 'auto';
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          updateMapCenter(coords);
          addCurrentLocationMarker(coords);
          findNearbyPharmacies(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          const defaultCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi
          setLocation(defaultCoords);
          findNearbyPharmacies(defaultCoords);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Geolocation not supported, use default location
      const defaultCoords = { lat: 28.6139, lng: 77.2090 };
      setLocation(defaultCoords);
      findNearbyPharmacies(defaultCoords);
      setLoading(false);
    }
  };

  const updateMapCenter = (coords) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(coords);
    }
  };

  const addCurrentLocationMarker = (coords) => {
    if (!mapInstanceRef.current) return;
    
    // Clear existing location marker
    if (window.currentLocationMarker) {
      window.currentLocationMarker.setMap(null);
    }
    
    window.currentLocationMarker = new window.google.maps.Marker({
      position: coords,
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      zIndex: 1000
    });
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  const addPharmacyMarkers = (pharmacyList) => {
    if (!mapInstanceRef.current) return;
    
    clearMarkers();
    
    pharmacyList.forEach((pharmacy, index) => {
      const marker = new window.google.maps.Marker({
        position: pharmacy.geometry.location,
        map: mapInstanceRef.current,
        title: pharmacy.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-lg">${pharmacy.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${pharmacy.vicinity}</p>
            ${pharmacy.rating ? `<p class="text-sm mb-2">Rating: ${pharmacy.rating}⭐</p>` : ''}
            <button 
              onclick="showDirectionsToPharmacy(${index})" 
              class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Show Route
            </button>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });
      
      markersRef.current.push(marker);
    });
    
    window.showDirectionsToPharmacy = (index) => {
      showRouteOnMap(pharmacyList[index]);
    };
  };

  const findNearbyPharmacies = async (coords, searchRadius = radius) => {
    try {
      const response = await fetch('/api/pharmacies/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coords, radius: searchRadius })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      const pharmacyList = data.pharmacies || [];
      setPharmacies(pharmacyList);
      addPharmacyMarkers(pharmacyList);
    } catch (error) {
      console.error('Error finding pharmacies:', error);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const showRouteOnMap = (pharmacy) => {
    setSelectedRoute(pharmacy);
    if (!location || !directionsServiceRef.current || !directionsRendererRef.current) return;
    
    directionsServiceRef.current.route({
      origin: location,
      destination: pharmacy.geometry.location,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
        const steps = result.routes[0].legs[0].steps;
        setNavigationSteps(steps);
      }
    });
  };

  const startNavigation = (pharmacy) => {
    setIsNavigating(true);
    setSelectedRoute(pharmacy);
    setCurrentStep(0);
    
    // Start watching user's location for live navigation
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          updateMapCenter(newLocation);
          addCurrentLocationMarker(newLocation);
          
          // Update route with new location
          updateNavigationRoute(newLocation, pharmacy);
        },
        (error) => {
          console.error('Navigation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      );
      setWatchId(id);
    }
  };

  const updateNavigationRoute = (currentLocation, destination) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;
    
    directionsServiceRef.current.route({
      origin: currentLocation,
      destination: destination.geometry.location,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
        const steps = result.routes[0].legs[0].steps;
        setNavigationSteps(steps);
        
        // Check if we're close to destination (within 50 meters)
        const distance = result.routes[0].legs[0].distance.value;
        if (distance < 50) {
          stopNavigation();
          alert('You have arrived at your destination!');
        }
      }
    });
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationSteps([]);
    setCurrentStep(0);
    
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const getDirections = (pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${pharmacy.geometry.location.lat},${pharmacy.geometry.location.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getPharmacyMapUrl = () => {
    return `https://www.google.com/maps/embed/v1/search?key=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ&q=pharmacy+near+${location.lat},${location.lng}&center=${location.lat},${location.lng}&zoom=14`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-full sm:max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">NEARBY PHARMACIES</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Search Radius:</label>
              <select
                value={radius}
                onChange={(e) => {
                  const newRadius = parseInt(e.target.value);
                  setRadius(newRadius);
                  if (location) {
                    setLoading(true);
                    findNearbyPharmacies(location, newRadius);
                  }
                }}
                className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={7000}>7 km</option>
                <option value={10000}>10 km</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Finding pharmacies near you...</p>
            </div>
          )}

          {/* Navigation Status */}
          {isNavigating && (
            <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Navigation className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold">Navigating to {selectedRoute?.name}</h3>
                    <p className="text-blue-100 text-xs sm:text-sm">Live navigation active</p>
                  </div>
                </div>
                <button
                  onClick={stopNavigation}
                  className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  Stop Navigation
                </button>
              </div>
              
              {navigationSteps.length > 0 && currentStep < navigationSteps.length && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-700 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium mb-1">Next Turn:</p>
                  <p className="text-blue-100 text-xs sm:text-sm" dangerouslySetInnerHTML={{ 
                    __html: navigationSteps[currentStep]?.instructions || 'Continue straight' 
                  }} />
                  <p className="text-xs text-blue-200 mt-1">
                    Distance: {navigationSteps[currentStep]?.distance?.text || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Map Section */}
          <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 sm:mb-8 relative">
            {location ? (
              <>
                <iframe
                  src={selectedRoute ? 
                    `https://www.google.com/maps/embed/v1/directions?key=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ&origin=${location.lat},${location.lng}&destination=${selectedRoute.geometry.location.lat},${selectedRoute.geometry.location.lng}&mode=driving` :
                    getPharmacyMapUrl()
                  }
                  width="100%"
                  height={isNavigating ? (window.innerWidth < 640 ? "300" : "500") : (window.innerWidth < 640 ? "250" : "400")}
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div ref={mapRef} className={`absolute top-0 left-0 w-full ${isNavigating ? 'h-[300px] sm:h-[500px]' : 'h-[250px] sm:h-[400px]'} pointer-events-none`} />
              </>
            ) : (
              <div className="p-4 sm:p-6 flex items-center justify-center h-[250px] sm:h-[400px]">
                <div className="text-center">
                  <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Pharmacy List */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              NEARBY PHARMACIES ({pharmacies.length})
            </h2>
            
            {pharmacies.map((pharmacy, index) => (
              <div
                key={index}
                className={`p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPharmacy === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedPharmacy(index)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                    {pharmacy.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {pharmacy.rating || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{pharmacy.vicinity}</span>
                  </div>
                  
                  {pharmacy.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className={pharmacy.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
                        {pharmacy.opening_hours.open_now ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showRouteOnMap(pharmacy);
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                  >
                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                    Show Route
                  </button>
                  
                  {selectedRoute && selectedRoute.place_id === pharmacy.place_id && !isNavigating && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startNavigation(pharmacy);
                      }}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                      Start Navigation
                    </button>
                  )}
                  
                  {selectedRoute && selectedRoute.place_id === pharmacy.place_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoute(null);
                        if (isNavigating) stopNavigation();
                      }}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                    >
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      Clear Route
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(pharmacy);
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
                  >
                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                    Open in Maps
                  </button>
                  
                  {pharmacy.formatted_phone_number && (
                    <a
                      href={`tel:${pharmacy.formatted_phone_number}`}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {!loading && pharmacies.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">No pharmacies found nearby</p>
                <button
                  onClick={getCurrentLocation}
                  className="mt-4 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Retry Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
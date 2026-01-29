'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, Navigation, Star, Building2, Cross } from 'lucide-react';

export default function NearbyServices() {
  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [serviceType, setServiceType] = useState('hospital');
  const [ambulances, setAmbulances] = useState([]);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const markersRef = useRef([]);

  const serviceTypes = {
    hospital: { label: 'Hospitals', icon: Cross, color: 'red' },
    cemetery: { label: 'Graveyards', icon: Building2, color: 'gray' },
    ambulance: { label: 'Live Ambulances', icon: Cross, color: 'orange' },
    clinic: { label: 'Clinics', icon: Cross, color: 'blue' }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      loadGoogleMaps();
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      setLoading(true);
      if (serviceType === 'ambulance') {
        startAmbulanceTracking();
      } else {
        stopAmbulanceTracking();
        findNearbyServices(location, radius, serviceType);
      }
    }
  }, [serviceType, radius]);

  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

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
    
    addCurrentLocationMarker(location);
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
          console.log('Current location:', coords);
          setLocation(coords);
          updateMapCenter(coords);
          addCurrentLocationMarker(coords);
          findNearbyServices(coords, radius, serviceType);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Mumbai coordinates if location fails
          const fallbackCoords = { lat: 19.0760, lng: 72.8777 };
          setLocation(fallbackCoords);
          updateMapCenter(fallbackCoords);
          addCurrentLocationMarker(fallbackCoords);
          findNearbyServices(fallbackCoords, radius, serviceType);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      // Fallback if geolocation not supported
      const fallbackCoords = { lat: 19.0760, lng: 72.8777 };
      setLocation(fallbackCoords);
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

  const addAmbulanceMarkers = (ambulanceList) => {
    if (!mapInstanceRef.current) return;
    
    clearMarkers();
    
    ambulanceList.forEach((ambulance, index) => {
      const marker = new window.google.maps.Marker({
        position: ambulance.location,
        map: mapInstanceRef.current,
        title: ambulance.id,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#FF6B35',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: ambulance.heading || 0
        },
        animation: window.google.maps.Animation.BOUNCE
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-lg">🚑 ${ambulance.id}</h3>
            <p class="text-sm text-gray-600 mb-2">Status: ${ambulance.status}</p>
            <p class="text-sm text-gray-600 mb-2">Speed: ${ambulance.speed || 0} km/h</p>
            <p class="text-sm text-gray-600 mb-2">Distance: ${ambulance.distance}m</p>
            <p class="text-sm text-green-600 mb-2">🟢 Live Tracking</p>
            <button 
              onclick="callAmbulance('${ambulance.phone}')" 
              class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 mr-2"
            >
              Call Now
            </button>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });
      
      markersRef.current.push(marker);
    });
    
    window.callAmbulance = (phone) => {
      window.open(`tel:${phone}`, '_self');
    };
  };

  const addServiceMarkers = (serviceList) => {
    if (!mapInstanceRef.current) return;
    
    clearMarkers();
    
    serviceList.forEach((service, index) => {
      const marker = new window.google.maps.Marker({
        position: service.geometry?.location || service.location,
        map: mapInstanceRef.current,
        title: service.name || service.id,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: serviceTypes[serviceType].color === 'red' ? '#EF4444' : 
                     serviceTypes[serviceType].color === 'gray' ? '#6B7280' :
                     serviceTypes[serviceType].color === 'orange' ? '#FF6B35' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-lg">${service.name || service.id}</h3>
            <p class="text-sm text-gray-600 mb-2">${service.vicinity || service.status}</p>
            ${service.rating ? `<p class="text-sm mb-2">Rating: ${service.rating}⭐</p>` : ''}
            <button 
              onclick="showDirectionsToService(${index})" 
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
    
    window.showDirectionsToService = (index) => {
      showRouteOnMap(serviceList[index]);
    };
  };

  const startAmbulanceTracking = () => {
    // Initial fetch
    fetchLiveAmbulances();
    
    // Set up real-time tracking every 5 seconds for live updates
    const interval = setInterval(() => {
      fetchLiveAmbulances();
      // Update user location every 30 seconds
      if (Math.random() < 0.2) { // 20% chance to update location
        getCurrentLocation();
      }
    }, 5000);
    
    setTrackingInterval(interval);
  };

  const stopAmbulanceTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
  };

  const fetchLiveAmbulances = async () => {
    try {
      const response = await fetch('/api/ambulance-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...location, radius })
      });
      
      const data = await response.json();
      const ambulanceList = data.ambulances || [];
      setAmbulances(ambulanceList);
      setServices(ambulanceList);
      addAmbulanceMarkers(ambulanceList);
    } catch (error) {
      console.error('Error tracking ambulances:', error);
      setAmbulances([]);
    } finally {
      setLoading(false);
    }
  };

  const findNearbyServices = async (coords, searchRadius = radius, type = serviceType) => {
    try {
      const response = await fetch('/api/nearby-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coords, radius: searchRadius, type })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const serviceList = data.services || [];
      setServices(serviceList);
      addServiceMarkers(serviceList);
    } catch (error) {
      console.error('Error finding services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const showRouteOnMap = (service) => {
    setSelectedRoute(service);
    if (!location || !directionsServiceRef.current || !directionsRendererRef.current) return;
    
    const destination = service.geometry?.location || service.location;
    if (!destination) return;
    
    directionsServiceRef.current.route({
      origin: location,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
      }
    });
  };

  const getDirections = (service) => {
    const destination = service.geometry?.location || service.location;
    if (!destination) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getServiceMapUrl = () => {
    return `https://www.google.com/maps/embed/v1/search?key=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ&q=${serviceType}+near+${location.lat},${location.lng}&center=${location.lat},${location.lng}&zoom=14`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6 w-full overflow-x-hidden">
      <div className="max-w-full sm:max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">NEARBY SERVICES</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700">Service Type:</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                >
                  {Object.entries(serviceTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700">Radius:</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                >
                  <option value={2000}>2 km</option>
                  <option value={5000}>5 km</option>
                  <option value={7000}>7 km</option>
                  <option value={10000}>10 km</option>
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {serviceType === 'ambulance' ? '🚑 Tracking live ambulances...' : `Finding ${serviceTypes[serviceType].label.toLowerCase()} near you...`}
              </p>
            </div>
          )}

          {/* Map Section */}
          <div className="bg-gray-100 rounded-xl overflow-hidden mb-8 relative">
            {location ? (
              <>
                <iframe
                  src={selectedRoute ? 
                    `https://www.google.com/maps/embed/v1/directions?key=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ&origin=${location.lat},${location.lng}&destination=${(selectedRoute.geometry?.location || selectedRoute.location).lat},${(selectedRoute.geometry?.location || selectedRoute.location).lng}&mode=driving` :
                    getServiceMapUrl()
                  }
                  width="100%"
                  height="300"
                  className="sm:h-[400px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div ref={mapRef} className="absolute top-0 left-0 w-full h-[400px] pointer-events-none" />
              </>
            ) : (
              <div className="p-6 flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Services List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              NEARBY {serviceTypes[serviceType].label.toUpperCase()} ({services.length})
            </h2>
            
            {services.map((service, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedService === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedService(index)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {service.rating || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{service.vicinity}</span>
                  </div>
                  
                  {service.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className={service.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}>
                        {service.opening_hours.open_now ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showRouteOnMap(service);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    Show Route
                  </button>
                  
                  {selectedRoute && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoute(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <MapPin className="w-4 h-4" />
                      Clear Route
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(service);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate
                  </button>
                  
                  {service.formatted_phone_number && (
                    <a
                      href={`tel:${service.formatted_phone_number}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {!loading && services.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {serviceType === 'ambulance' ? 'No ambulances currently tracked in this area' : `No ${serviceTypes[serviceType].label.toLowerCase()} found nearby`}
                </p>
                <button
                  onClick={getCurrentLocation}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
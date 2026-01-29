'use client';

import { useEffect, useRef } from 'react';

export default function PharmacyMap({ pharmacies, userLocation, selectedPharmacy }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && userLocation) {
      initializeMap();
    }
  }, [userLocation]);

  useEffect(() => {
    if (mapInstanceRef.current && pharmacies.length > 0) {
      addPharmacyMarkers();
    }
  }, [pharmacies]);

  const initializeMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 14,
      styles: [
        {
          featureType: 'poi.medical',
          elementType: 'geometry',
          stylers: [{ color: '#ffeaa7' }]
        }
      ]
    });

    // Add user location marker
    new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
      }
    });

    mapInstanceRef.current = map;
  };

  const addPharmacyMarkers = () => {
    pharmacies.forEach((pharmacy, index) => {
      const marker = new window.google.maps.Marker({
        position: pharmacy.geometry.location,
        map: mapInstanceRef.current,
        title: pharmacy.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#10B981"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${pharmacy.name}</h3>
            <p class="text-sm text-gray-600">${pharmacy.vicinity}</p>
            ${pharmacy.rating ? `<p class="text-sm">Rating: ${pharmacy.rating}⭐</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });
    });
  };

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
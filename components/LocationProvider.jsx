'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export default function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Live location detected:', coords);
        setLocation(coords);
        
        // Get address from coordinates
        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ`);
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            setAddress(data.results[0].formatted_address);
          } else {
            setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const value = {
    location,
    address,
    loading,
    error,
    getCurrentLocation,
    setAddress
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
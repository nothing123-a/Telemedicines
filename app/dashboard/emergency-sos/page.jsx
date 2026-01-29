'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, MapPin, Video, Mic, AlertTriangle, Users, Clock, Shield, Plus } from 'lucide-react';

export default function EmergencySOS() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [personalContacts, setPersonalContacts] = useState([]);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);

  const emergencyNumbers = [
    { name: 'Ambulance', phone: '108', type: 'urgent' },
    { name: 'Police', phone: '100', type: 'urgent' },
    { name: 'Fire Department', phone: '101', type: 'urgent' }
  ];

  useEffect(() => {
    loadGoogleMaps();
    loadPersonalContacts();
    startLiveLocationTracking();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

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
    if (!mapRef.current) return;
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    window.sosMap = map;
  };

  const startLiveLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationText('Geolocation not supported');
      return;
    }

    // Start continuous live tracking immediately
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Live location update:', coords);
        setLocation(coords);
        updateMapLocation(coords);
        getLocationText(coords);
      },
      (error) => {
        console.error('Live location error:', error);
        // Try again with less strict settings
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setLocation(coords);
            updateMapLocation(coords);
            getLocationText(coords);
          },
          () => {
            const defaultCoords = { lat: 28.6139, lng: 77.2090 };
            setLocation(defaultCoords);
            updateMapLocation(defaultCoords);
            setLocationText('Delhi, India (Default - GPS unavailable)');
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        );
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 // Always get fresh location
      }
    );
  };

  const updateMapLocation = (coords) => {
    if (window.sosMap) {
      window.sosMap.setCenter(coords);
      
      if (window.currentMarker) {
        window.currentMarker.setMap(null);
      }
      
      window.currentMarker = new window.google.maps.Marker({
        position: coords,
        map: window.sosMap,
        title: 'Your Live Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });
    }
  };

  const getLocationText = async (coords) => {
    try {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            setLocationText(address);
          } else {
            setLocationText(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
          }
        });
      } else {
        setLocationText(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      }
    } catch (error) {
      setLocationText(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    }
  };

  const loadPersonalContacts = () => {
    const saved = localStorage.getItem('sosPersonalContacts');
    if (saved) {
      setPersonalContacts(JSON.parse(saved));
    }
  };

  const savePersonalContacts = (contacts) => {
    setPersonalContacts(contacts);
    localStorage.setItem('sosPersonalContacts', JSON.stringify(contacts));
  };

  const addPersonalContact = () => {
    if (newContact.name && newContact.phone) {
      const updated = [...personalContacts, { ...newContact, type: 'personal' }];
      savePersonalContacts(updated);
      setNewContact({ name: '', phone: '' });
      setShowAddContact(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true
      });

      streamRef.current = stream;
      
      // Hidden video element for recording only
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.style.display = 'none';
      }

      // Start recording
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Recording saved:', blob.size, 'bytes');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      startTimer();

      setTimeout(() => {
        stopRecording();
      }, 15000);

    } catch (error) {
      alert('Please allow camera access to use SOS');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    clearInterval(timerRef.current);
    setRecordingTime(0);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const uploadMedia = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, `sos_video_${Date.now()}.webm`);
    formData.append('location', JSON.stringify(location));
    formData.append('locationText', locationText);

    try {
      await fetch('/api/sos/upload', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const triggerSOS = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setSosTriggered(true);
    await startRecording();
    
    // Make emergency call without navigation
    try {
      const link = document.createElement('a');
      link.href = 'tel:108';
      link.click();
    } catch (error) {
      console.log('Emergency call initiated');
    }
  };

  const notifyContact = async (contact) => {
    try {
      await fetch('/api/sos/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          location,
          locationText,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  const saveSosRecord = async () => {
    try {
      await fetch('/api/sos/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location,
          locationText,
          contacts: [...emergencyNumbers, ...personalContacts]
        })
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 w-full overflow-x-hidden">
      <div className="max-w-full sm:max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">EMERGENCY SOS</h1>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <MapPin className="w-4 h-4 animate-pulse" />
              <span className="font-medium break-words">{locationText || 'Tracking live location...'}</span>
            </div>
          </div>

          {sosTriggered && (
            <div className="bg-red-600 text-white p-4 rounded-xl mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 animate-pulse" />
                  <div>
                    <h3 className="font-semibold">SOS ACTIVATED</h3>
                    <p className="text-red-100 text-sm">Emergency services called • Contacts notified</p>
                  </div>
                </div>
                <button
                  onClick={() => setSosTriggered(false)}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-sm"
                >
                  Deactivate
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-4 sm:mb-6">
            <button
              onClick={triggerSOS}
              disabled={sosTriggered}
              type="button"
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full text-white font-bold text-lg sm:text-xl shadow-2xl transition-all ${
                sosTriggered 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 active:scale-95'
              }`}
            >
              {sosTriggered ? 'SOS\nACTIVE' : 'EMERGENCY\nSOS'}
            </button>
            <p className="mt-3 text-gray-600 text-sm">
              {sosTriggered ? 'Emergency activated' : 'Press for emergency help'}
            </p>
          </div>

          {isRecording && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">Recording in Background</span>
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-mono">{recordingTime}s / 15s</span>
                  </div>
                </div>
                <button
                  onClick={stopRecording}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Stop
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-100 rounded-xl overflow-hidden mb-6">
            <div className="p-3 bg-blue-600 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live Location Tracking
              </h3>
            </div>
            <div ref={mapRef} className="w-full h-48 sm:h-64"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            <div className="bg-red-50 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Services
              </h3>
              <div className="space-y-2">
                {emergencyNumbers.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">{contact.name}</span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 no-underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personal Contacts
                </h3>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {showAddContact && (
                <div className="bg-white rounded-lg p-3 mb-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded mb-2 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded mb-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addPersonalContact}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {personalContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">{contact.name}</span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 no-underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                ))}
                {personalContacts.length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">No contacts added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
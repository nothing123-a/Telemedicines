'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MapPin, ShoppingCart, Pill, Navigation, CheckCircle, XCircle, Clock, Bell, Globe } from 'lucide-react';

const translations = {
  en: {
    title: 'Pharmacy Services',
    subtitle: 'Find medicines online or locate nearby pharmacies',
    nearbyPharmacies: 'Find Nearby Pharmacies',
    nearbyDesc: 'Locate physical pharmacies near your location with directions and contact information',
    realTimeTracking: '• Real-time location tracking',
    storeHours: '• Store hours and ratings',
    navigation: '• Direct navigation support',
    availabilityChecker: 'Medicine Availability Checker',
    availabilityDesc: 'Check which nearby pharmacies have your medicine in stock before traveling',
    stockChecking: '• Real-time stock checking',
    smsService: '• SMS service for offline use',
    reserveMedicines: '• Reserve medicines online',
    onlineStore: 'Online Medicine Store',
    onlineDesc: 'Browse and order medicines online with home delivery options',
    medicineCatalog: '• Wide medicine catalog',
    prescriptionUpload: '• Prescription upload',
    homeDelivery: '• Home delivery available',
    requestedMedicine: 'REQUESTED MEDICINE',
    pharmacist: 'Pharmacist',
    user: 'User',
    noRequests: 'No new medicine requests',
    patient: 'Patient',
    available: 'Available',
    notAvailable: 'Not Available'
  },
  hi: {
    title: 'फार्मेसी सेवाएं',
    subtitle: 'ऑनलाइन दवाएं खोजें या नजदीकी फार्मेसी का पता लगाएं',
    nearbyPharmacies: 'नजदीकी फार्मेसी खोजें',
    nearbyDesc: 'दिशा और संपर्क जानकारी के साथ अपने स्थान के पास भौतिक फार्मेसी का पता लगाएं',
    realTimeTracking: '• रियल-टाइम स्थान ट्रैकिंग',
    storeHours: '• स्टोर के घंटे और रेटिंग',
    navigation: '• प्रत्यक्ष नेवीगेशन सहायता',
    availabilityChecker: 'दवा उपलब्धता चेकर',
    availabilityDesc: 'यात्रा करने से पहले जांचें कि कौन सी नजदीकी फार्मेसी में आपकी दवा स्टॉक में है',
    stockChecking: '• रियल-टाइम स्टॉक चेकिंग',
    smsService: '• ऑफलाइन उपयोग के लिए SMS सेवा',
    reserveMedicines: '• ऑनलाइन दवाएं रिजर्व करें',
    onlineStore: 'ऑनलाइन दवा स्टोर',
    onlineDesc: 'होम डिलीवरी विकल्पों के साथ ऑनलाइन दवाएं ब्राउज़ करें और ऑर्डर करें',
    medicineCatalog: '• व्यापक दवा कैटलॉग',
    prescriptionUpload: '• प्रिस्क्रिप्शन अपलोड',
    homeDelivery: '• होम डिलीवरी उपलब्ध',
    requestedMedicine: 'अनुरोधित दवा',
    pharmacist: 'फार्मासिस्ट',
    user: 'उपयोगकर्ता',
    noRequests: 'कोई नई दवा अनुरोध नहीं',
    patient: 'मरीज़',
    available: 'उपलब्ध',
    notAvailable: 'उपलब्ध नहीं'
  },
  pa: {
    title: 'ਫਾਰਮੇਸੀ ਸੇਵਾਵਾਂ',
    subtitle: 'ਔਨਲਾਈਨ ਦਵਾਈਆਂ ਲੱਭੋ ਜਾਂ ਨੇੜਲੀ ਫਾਰਮੇਸੀ ਲੱਭੋ',
    nearbyPharmacies: 'ਨੇੜਲੀ ਫਾਰਮੇਸੀ ਲੱਭੋ',
    nearbyDesc: 'ਦਿਸ਼ਾ ਅਤੇ ਸੰਪਰਕ ਜਾਣਕਾਰੀ ਦੇ ਨਾਲ ਆਪਣੇ ਸਥਾਨ ਦੇ ਨੇੜੇ ਭੌਤਿਕ ਫਾਰਮੇਸੀ ਲੱਭੋ',
    realTimeTracking: '• ਰੀਅਲ-ਟਾਈਮ ਸਥਾਨ ਟਰੈਕਿੰਗ',
    storeHours: '• ਸਟੋਰ ਦੇ ਘੰਟੇ ਅਤੇ ਰੇਟਿੰਗ',
    navigation: '• ਸਿੱਧੀ ਨੇਵੀਗੇਸ਼ਨ ਸਹਾਇਤਾ',
    availabilityChecker: 'ਦਵਾਈ ਉਪਲਬਧਤਾ ਚੈਕਰ',
    availabilityDesc: 'ਯਾਤਰਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਜਾਂਚੋ ਕਿ ਕਿਹੜੀ ਨੇੜਲੀ ਫਾਰਮੇਸੀ ਵਿੱਚ ਤੁਹਾਡੀ ਦਵਾਈ ਸਟਾਕ ਵਿੱਚ ਹੈ',
    stockChecking: '• ਰੀਅਲ-ਟਾਈਮ ਸਟਾਕ ਚੈਕਿੰਗ',
    smsService: '• ਔਫਲਾਈਨ ਵਰਤੋਂ ਲਈ SMS ਸੇਵਾ',
    reserveMedicines: '• ਔਨਲਾਈਨ ਦਵਾਈਆਂ ਰਿਜ਼ਰਵ ਕਰੋ',
    onlineStore: 'ਔਨਲਾਈਨ ਦਵਾਈ ਸਟੋਰ',
    onlineDesc: 'ਘਰ ਡਿਲੀਵਰੀ ਵਿਕਲਪਾਂ ਦੇ ਨਾਲ ਔਨਲਾਈਨ ਦਵਾਈਆਂ ਬਰਾਊਜ਼ ਕਰੋ ਅਤੇ ਆਰਡਰ ਕਰੋ',
    medicineCatalog: '• ਵਿਆਪਕ ਦਵਾਈ ਕੈਟਾਲਾਗ',
    prescriptionUpload: '• ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਅਪਲੋਡ',
    homeDelivery: '• ਘਰ ਡਿਲੀਵਰੀ ਉਪਲਬਧ',
    requestedMedicine: 'ਬੇਨਤੀ ਕੀਤੀ ਦਵਾਈ',
    pharmacist: 'ਫਾਰਮਾਸਿਸਟ',
    user: 'ਉਪਭੋਗਤਾ',
    noRequests: 'ਕੋਈ ਨਵੀਂ ਦਵਾਈ ਬੇਨਤੀ ਨਹੀਂ',
    patient: 'ਮਰੀਜ਼',
    available: 'ਉਪਲਬਧ',
    notAvailable: 'ਉਪਲਬਧ ਨਹੀਂ'
  }
};

export default function PharmacyDashboard() {
  const { data: session } = useSession();
  const [requestedMedicines, setRequestedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  const t = translations[language];


  useEffect(() => {
    fetchRequestedMedicines();
    
    const interval = setInterval(fetchRequestedMedicines, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequestedMedicines = async () => {
    try {
      console.log('🔍 Pharmacy page: Fetching requested medicines...');
      const response = await fetch('/api/prescription/requested');
      console.log('📡 API Response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Full API response:', data);
      console.log('💊 Prescriptions array:', data.prescriptions);
      console.log('🔢 Number of prescriptions:', data.prescriptions?.length || 0);
      
      // Show all prescriptions from API
      const medicines = data.prescriptions || [];
      console.log('✅ Setting requested medicines:', medicines);
      setRequestedMedicines(medicines);
    } catch (error) {
      console.error('❌ Error fetching requested medicines:', error);
      setRequestedMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailability = async (prescriptionId, status) => {
    try {
      const response = await fetch('/api/prescription/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, status, pharmacistId: session.user.id })
      });
      
      if (response.ok) {
        fetchRequestedMedicines();
        alert(`Medicine marked as ${status}`);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Language Dropdown */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <select 
                value={language} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
              </select>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Pill className="w-16 h-16 text-blue-600" />
              <div className="relative bg-orange-100 p-3 rounded-full">
                <Bell className="w-12 h-12 text-orange-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
                  {requestedMedicines.length || 0}
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Physical Pharmacy Card */}
            <Link href="/dashboard/pharmacy/physical">
              <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <MapPin className="w-12 h-12" />
                  <Navigation className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">{t.nearbyPharmacies}</h2>
                <p className="text-blue-100 mb-4">
                  {t.nearbyDesc}
                </p>
                
                <div className="flex items-center text-sm text-blue-100">
                  <span>{t.realTimeTracking}</span>
                </div>
                <div className="flex items-center text-sm text-blue-100">
                  <span>{t.storeHours}</span>
                </div>
                <div className="flex items-center text-sm text-blue-100">
                  <span>{t.navigation}</span>
                </div>
              </div>
            </Link>

            {/* Offline Medicine Checker Card */}
            <Link href="/dashboard/pharmacy/offline">
              <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <Pill className="w-12 h-12" />
                  <MapPin className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">{t.availabilityChecker}</h2>
                <p className="text-purple-100 mb-4">
                  {t.availabilityDesc}
                </p>
                
                <div className="flex items-center text-sm text-purple-100">
                  <span>{t.stockChecking}</span>
                </div>
                <div className="flex items-center text-sm text-purple-100">
                  <span>{t.smsService}</span>
                </div>
                <div className="flex items-center text-sm text-purple-100">
                  <span>{t.reserveMedicines}</span>
                </div>
              </div>
            </Link>

            {/* Online Pharmacy Card */}
            <Link href="/dashboard/pharmacy/online">
              <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <ShoppingCart className="w-12 h-12" />
                  <Pill className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3">{t.onlineStore}</h2>
                <p className="text-green-100 mb-4">
                  {t.onlineDesc}
                </p>
                
                <div className="flex items-center text-sm text-green-100">
                  <span>{t.medicineCatalog}</span>
                </div>
                <div className="flex items-center text-sm text-green-100">
                  <span>{t.prescriptionUpload}</span>
                </div>
                <div className="flex items-center text-sm text-green-100">
                  <span>{t.homeDelivery}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Requested Medicines Section - For All Users */}
          <div className="mt-12 bg-orange-50 rounded-xl p-6 border border-orange-200">
              <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                {t.requestedMedicine} ({requestedMedicines.length})
                <span className="text-sm bg-orange-200 px-2 py-1 rounded">
                  {session?.user?.isPharmacist ? t.pharmacist : t.user}
                </span>
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                </div>
              ) : requestedMedicines.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-orange-600 mb-4">{t.noRequests}</p>
                  <p className="text-sm text-gray-500">Debug: Check browser console for API logs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requestedMedicines.map((prescription) => (
                    <div key={prescription._id} className="bg-white rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{t.patient}: {prescription.patientName}</h4>
                          <p className="text-sm text-gray-600">Dr. {prescription.doctorName} • {new Date(prescription.requestedAt || prescription.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAvailability(prescription._id, 'available')}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t.available}
                          </button>
                          <button
                            onClick={() => handleAvailability(prescription._id, 'unavailable')}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            {t.notAvailable}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {prescription.medicines.map((medicine, index) => (
                          <div key={index} className="bg-gray-50 rounded p-3">
                            <p className="font-medium text-gray-800">{medicine.name}</p>
                            <p className="text-sm text-gray-600">{medicine.dosage} • {medicine.frequency}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
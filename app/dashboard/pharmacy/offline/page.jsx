'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Search, Navigation, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function OfflinePharmacies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    await getPharmaciesFromMedicines();
  };

  const getPharmaciesFromMedicines = async () => {
    try {
      const res = await fetch('/api/medicine');
      const data = await res.json();
      console.log('Fetched medicines for offline pharmacy:', data);
      
      if (res.ok && data.medicines) {
        const pharmacyGroups = {};
        const pharmacistPromises = [];
        
        // Get unique pharmacist IDs
        const uniquePharmacistIds = [...new Set(data.medicines.map(med => med.pharmacistId))];
        
        // Fetch all pharmacist details
        for (const pharmacistId of uniquePharmacistIds) {
          if (pharmacistId !== 'temp_id') {
            pharmacistPromises.push(
              fetch(`/api/pharmacist/${pharmacistId}`)
                .then(res => res.json())
                .then(pharmacistData => ({ id: pharmacistId, ...pharmacistData }))
                .catch(() => ({ id: pharmacistId, name: 'Unknown', phoneNumber: '+91 9876543210', address: 'Address not available', pharmacyName: 'Unknown Pharmacy' }))
            );
          }
        }
        
        const pharmacistDetails = await Promise.all(pharmacistPromises);
        const pharmacistMap = {};
        pharmacistDetails.forEach(p => {
          pharmacistMap[p.id] = p;
        });
        
        // Fetch pharmacist data for temp_id medicines
        const tempPharmacistRes = await fetch('/api/pharmacist/temp');
        let tempPharmacist = {};
        if (tempPharmacistRes.ok) {
          tempPharmacist = await tempPharmacistRes.json();
        }
        
        data.medicines.forEach(med => {
          const pharmacist = pharmacistMap[med.pharmacistId] || tempPharmacist || {
            name: 'Unknown Pharmacist',
            phoneNumber: '+91 0000000000',
            address: 'Address not available',
            pharmacyName: med.pharmacyName
          };
          
          if (!pharmacyGroups[med.pharmacyName]) {
            pharmacyGroups[med.pharmacyName] = {
              id: Object.keys(pharmacyGroups).length + 1,
              name: pharmacist.pharmacyName || med.pharmacyName,
              address: pharmacist.address || "Address not available",
              phone: pharmacist.phoneNumber || "+91 0000000000",
              pharmacistName: pharmacist.name || "Unknown Pharmacist",
              distance: "0.5 km",
              timing: "8:00 AM - 10:00 PM",
              medicines: []
            };
          }
          
          pharmacyGroups[med.pharmacyName].medicines.push({
            name: med.name,
            status: med.stockStatus === 'in-stock' ? 'available' : 
                    med.stockStatus === 'out-of-stock' ? 'out-of-stock' : 'not-available',
            stock: med.stock,
            price: med.price,
            availabilityDate: med.restockDate,
            category: med.category,
            manufacturer: med.manufacturer,
            expiryDate: med.expiryDate
          });
        });
        
        const pharmaciesList = Object.values(pharmacyGroups);
        console.log('Processed pharmacies:', pharmaciesList);
        setPharmacies(pharmaciesList);
        setMedicines(data.medicines.map(med => med.name));
      }
    } catch (error) {
      console.error('Failed to load pharmacies:', error);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getAvailabilityStatus = (pharmacy, medicine) => {
    const status = pharmacy.availability[medicine];
    if (status === 'available') {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', text: 'Available' };
    } else if (status === 'low-stock') {
      return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Low Stock' };
    } else {
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', text: 'Out of Stock' };
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-8 border border-gray-200">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Local Pharmacies</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Find medicines at nearby pharmacies before you travel</p>
          
          {/* Search Section */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Search Medicine</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search medicine name..."
                  value={selectedMedicine}
                  onChange={(e) => setSelectedMedicine(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Search Pharmacy</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search pharmacy name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {(
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Available Pharmacies:
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Checking pharmacy stocks...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {filteredPharmacies
                  .filter(pharmacy => 
                    !selectedMedicine || 
                    pharmacy.medicines.some(med => 
                      med.name.toLowerCase().includes(selectedMedicine.toLowerCase())
                    )
                  )
                  .map((pharmacy) => (
                    <div key={pharmacy.id} className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-300 p-4 sm:p-6 md:p-8">
                      {/* Pharmacy Header */}
                      <div className="space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                        <div className="sm:col-span-2">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{pharmacy.name}</h3>
                          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-3">Pharmacist: <span className="font-semibold">{pharmacy.pharmacistName}</span></p>
                          <div className="flex items-start gap-2 sm:gap-3 text-gray-600">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0" />
                            <span className="text-sm sm:text-base leading-relaxed">{pharmacy.address}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="bg-blue-50 rounded-lg p-3 w-full sm:w-auto">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2">Contact Information</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm font-medium">{pharmacy.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">{pharmacy.timing}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Available Medicines Section */}
                      <div className="mb-4 sm:mb-6">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Available Medicines:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                          {pharmacy.medicines
                            .filter(med => 
                              !selectedMedicine || 
                              med.name.toLowerCase().includes(selectedMedicine.toLowerCase())
                            )
                            .map((medicine, idx) => (
                              <div key={idx} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all">
                                {/* Medicine Header */}
                                <div className="text-center mb-2 sm:mb-3">
                                  <h5 className="font-bold text-gray-900 text-base sm:text-lg capitalize mb-1">{medicine.name}</h5>
                                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">{medicine.category}</p>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="text-center mb-2 sm:mb-3">
                                  <span className={`inline-block px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                                    medicine.status === 'available' ? 'bg-green-100 text-green-800' : 
                                    medicine.status === 'out-of-stock' ? 'bg-red-100 text-red-800' : 
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {medicine.status === 'available' ? 'In Stock' : 
                                     medicine.status === 'out-of-stock' ? 'Out of Stock' : 
                                     'Not Available'}
                                  </span>
                                </div>
                                
                                {/* Price Section */}
                                <div className="text-center mb-2 sm:mb-3 bg-blue-50 rounded-lg p-2 sm:p-3">
                                  <p className="text-lg sm:text-2xl font-bold text-blue-600">₹{medicine.price}</p>
                                  <p className="text-xs sm:text-sm text-blue-500 font-medium">Price</p>
                                </div>
                                
                                {/* Stock Section */}
                                <div className="text-center mb-3 sm:mb-4 bg-gray-100 rounded-lg p-2 sm:p-3">
                                  <p className="text-base sm:text-xl font-bold text-gray-700">{medicine.stock}</p>
                                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Units Available</p>
                                </div>
                                
                                {/* Details */}
                                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                  <div className="bg-white rounded-lg p-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">Manufacturer:</span>
                                      <span className="font-bold text-gray-900 text-right truncate ml-1">{medicine.manufacturer}</span>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">Expiry Date:</span>
                                      <span className="font-bold text-gray-900">{medicine.expiryDate}</span>
                                    </div>
                                  </div>
                                  {medicine.status === 'out-of-stock' && medicine.availabilityDate && (
                                    <div className="bg-red-50 rounded-lg p-2 text-center">
                                      <p className="text-red-700 font-bold text-xs sm:text-sm">
                                        Available: {medicine.availabilityDate}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <a
                          href={`tel:${pharmacy.phone.replace(/\s+/g, '')}`}
                          className="bg-green-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl hover:bg-green-700 font-bold transition-colors text-base sm:text-lg flex items-center justify-center gap-2"
                        >
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                          Call Now
                        </a>
                        <button
                          onClick={() => {
                            const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pharmacy.address)}&travelmode=driving`;
                            window.open(mapUrl, '_blank');
                          }}
                          className="bg-blue-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl hover:bg-blue-700 font-bold transition-colors text-base sm:text-lg flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                          Navigate
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
            
            {!loading && filteredPharmacies.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <p className="text-gray-600">No pharmacies found matching your search.</p>
              </div>
            )}
          </div>
        )}
        
        {/* SMS Feature */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <h3 className="text-lg sm:text-xl font-bold mb-2">📱 SMS Service Available</h3>
          <p className="text-sm sm:text-base mb-3 sm:mb-4">No internet? Send SMS to check medicine availability:</p>
          <div className="bg-white/20 rounded-lg p-3 sm:p-4">
            <p className="font-mono text-xs sm:text-sm">
              Send: <strong>MED [Medicine Name] [Pincode]</strong><br/>
              To: <strong>+91 9876543210</strong>
            </p>
            <p className="text-xs mt-2 opacity-90">
              Example: MED Paracetamol 500mg 411001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
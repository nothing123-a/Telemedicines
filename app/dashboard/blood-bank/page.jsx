'use client';
import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Droplets, Search, Plus } from 'lucide-react';

export default function BloodBankPage() {
  const [activeTab, setActiveTab] = useState('nearby');
  const [bloodBanks, setBloodBanks] = useState([]);
  const [bloodStock, setBloodStock] = useState({});
  const [searchGroup, setSearchGroup] = useState('');
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    fetchNearbyBloodBanks();
    fetchBloodStock();
    fetchDonors();
  }, []);

  const fetchNearbyBloodBanks = async () => {
    try {
      const response = await fetch('/api/blood-bank/nearby');
      const data = await response.json();
      setBloodBanks(data.bloodBanks || []);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
    }
  };

  const fetchBloodStock = async () => {
    try {
      const response = await fetch('/api/blood-bank/stock');
      const data = await response.json();
      setBloodStock(data.stock || {});
    } catch (error) {
      console.error('Error fetching blood stock:', error);
    }
  };

  const fetchDonors = async () => {
    try {
      const response = await fetch('/api/blood-bank/donate');
      const data = await response.json();
      setDonors(data.donors || []);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const donorData = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/blood-bank/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorData)
      });
      
      if (response.ok) {
        alert('Donor registered successfully!');
        e.target.reset();
        fetchDonors();
      }
    } catch (error) {
      console.error('Error registering donor:', error);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const requestData = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/blood-bank/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        alert('Blood request submitted successfully!');
        e.target.reset();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8 text-center">
          Blood Bank Services
        </h1>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`px-6 py-3 rounded-lg font-medium transition-all border-2 border-black ${
              activeTab === 'nearby'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Nearby Blood Banks
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-3 rounded-lg font-medium transition-all border-2 border-black ${
              activeTab === 'stock'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Blood Availability
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`px-6 py-3 rounded-lg font-medium transition-all border-2 border-black ${
              activeTab === 'request'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Request Blood
          </button>
          <button
            onClick={() => setActiveTab('donate')}
            className={`px-6 py-3 rounded-lg font-medium transition-all border-2 border-black ${
              activeTab === 'donate'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Donate Blood
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-6 py-3 rounded-lg font-medium transition-all border-2 border-black ${
              activeTab === 'donors'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Available Donors
          </button>
        </div>

        {/* Nearby Blood Banks Tab */}
        {activeTab === 'nearby' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bloodBanks.map((bank, index) => (
              <div key={index} className="bg-white border-2 border-black rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold text-black mb-3">{bank.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-black">{bank.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-black">{bank.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-black">{bank.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black">Distance: {bank.distance}</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity border-2 border-black">
                  Contact Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Blood Stock Tab */}
        {activeTab === 'stock' && (
          <div>
            <div className="mb-6">
              <div className="flex gap-4 items-center justify-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search blood group..."
                    value={searchGroup}
                    onChange={(e) => setSearchGroup(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bloodGroups.map((group) => (
                <div key={group} className="bg-white border-2 border-black rounded-xl p-6 text-center hover:shadow-lg transition-all">
                  <div className="flex items-center justify-center mb-3">
                    <Droplets className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">{group}</h3>
                  <p className="text-3xl font-bold text-red-500 mb-1">
                    {bloodStock[group] || 0}
                  </p>
                  <p className="text-sm text-black">Units Available</p>
                  <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium border border-black ${
                    (bloodStock[group] || 0) > 10 
                      ? 'bg-green-100 text-black' 
                      : (bloodStock[group] || 0) > 5 
                        ? 'bg-yellow-100 text-black'
                        : 'bg-red-100 text-black'
                  }`}>
                    {(bloodStock[group] || 0) > 10 ? 'Available' : (bloodStock[group] || 0) > 5 ? 'Low Stock' : 'Critical'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Blood Tab */}
        {activeTab === 'request' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-black rounded-xl p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Request Blood</h2>
              <form className="space-y-6" onSubmit={handleRequestSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Patient Name</label>
                    <input
                      type="text"
                      name="patientName"
                      required
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Blood Group</label>
                    <select name="bloodGroup" required className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none">
                      <option value="">Select blood group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Units Needed</label>
                    <input
                      type="number"
                      name="unitsNeeded"
                      min="1"
                      required
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                      placeholder="Number of units"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Required Date</label>
                    <input
                      type="date"
                      name="requiredDate"
                      required
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Hospital/Clinic</label>
                  <input
                    type="text"
                    name="hospital"
                    required
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    placeholder="Hospital or clinic name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contact"
                    required
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    placeholder="Emergency contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Additional Notes</label>
                  <textarea
                    rows="3"
                    name="notes"
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    placeholder="Any additional information or urgency details"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 border-2 border-black"
                >
                  <Plus className="w-5 h-5" />
                  Submit Blood Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Donate Blood Tab */}
        {activeTab === 'donate' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-black rounded-xl p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Donate Blood</h2>
              <form className="space-y-6" onSubmit={handleDonateSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Blood Group</label>
                    <select name="bloodGroup" required className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none">
                      <option value="">Select your blood group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      min="18"
                      max="65"
                      required
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                      placeholder="Your age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      min="50"
                      required
                      className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                      placeholder="Your weight"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    placeholder="Your contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    placeholder="Your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Last Donation Date</label>
                  <input
                    type="date"
                    name="lastDonation"
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Medical History</label>
                  <textarea
                    rows="3"
                    name="medicalHistory"
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:border-red-500 focus:outline-none"
                    placeholder="Any medical conditions or medications"
                  ></textarea>
                </div>

                <div className="bg-red-50 border-2 border-black rounded-lg p-4">
                  <h3 className="font-semibold text-black mb-2">Eligibility Criteria:</h3>
                  <ul className="text-sm text-black space-y-1">
                    <li>• Age: 18-65 years</li>
                    <li>• Weight: Minimum 50 kg</li>
                    <li>• Good health condition</li>
                    <li>• No recent illness or medication</li>
                    <li>• Minimum 3 months gap from last donation</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 border-2 border-black"
                >
                  <Plus className="w-5 h-5" />
                  Register as Donor
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Available Donors Tab */}
        {activeTab === 'donors' && (
          <div>
            <h2 className="text-2xl font-bold text-black mb-6 text-center">Available Blood Donors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map((donor, index) => (
                <div key={index} className="bg-white border-2 border-black rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-black">{donor.name}</h3>
                    <div className="bg-red-100 border border-black px-3 py-1 rounded-full">
                      <span className="text-lg font-bold text-red-600">{donor.bloodGroup}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-black">
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span className="font-medium">{donor.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span className="font-medium">{donor.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{donor.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Donation:</span>
                      <span className="font-medium">{donor.lastDonation}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t-2 border-black">
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border border-black ${
                        donor.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {donor.status}
                      </span>
                      <button className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity border border-black">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {donors.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white border-2 border-black rounded-xl p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-black mb-2">No donors available</h3>
                  <p className="text-black mb-6">Be the first to register as a blood donor</p>
                  <button
                    onClick={() => setActiveTab('donate')}
                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity border-2 border-black"
                  >
                    Register as Donor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
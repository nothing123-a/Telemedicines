'use client';

import { useState, useEffect } from 'react';
import { User, Heart, Phone, AlertCircle } from 'lucide-react';

export default function PatientProfileSetup({ onComplete }) {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    // Load existing profile data
    const savedProfile = {
      name: localStorage.getItem('patientName') || '',
      age: localStorage.getItem('patientAge') || '',
      bloodType: localStorage.getItem('bloodType') || '',
      allergies: localStorage.getItem('allergies') || '',
      medications: localStorage.getItem('currentMedications') || '',
      medicalConditions: localStorage.getItem('medicalConditions') || '',
      emergencyContact: localStorage.getItem('primaryEmergencyContact') || '',
      emergencyPhone: localStorage.getItem('emergencyContactPhone') || ''
    };
    setProfile(savedProfile);
  }, []);

  const handleSave = () => {
    // Save to localStorage
    Object.entries(profile).forEach(([key, value]) => {
      const storageKey = key === 'emergencyContact' ? 'primaryEmergencyContact' :
                        key === 'emergencyPhone' ? 'emergencyContactPhone' :
                        key === 'medications' ? 'currentMedications' : 
                        key === 'name' ? 'patientName' :
                        key === 'age' ? 'patientAge' : key;
      localStorage.setItem(storageKey, value);
    });

    if (onComplete) onComplete();
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Emergency Profile Setup</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({...profile, age: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
          <select
            value={profile.bloodType}
            onChange={(e) => setProfile({...profile, bloodType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select blood type</option>
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
          <input
            type="text"
            value={profile.emergencyContact}
            onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Emergency contact name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
          <input
            type="tel"
            value={profile.emergencyPhone}
            onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Emergency contact phone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
          <input
            type="text"
            value={profile.allergies}
            onChange={(e) => setProfile({...profile, allergies: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Known allergies (e.g., Penicillin, Nuts)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
          <textarea
            value={profile.medications}
            onChange={(e) => setProfile({...profile, medications: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="List current medications and dosages"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
          <textarea
            value={profile.medicalConditions}
            onChange={(e) => setProfile({...profile, medicalConditions: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Chronic conditions, disabilities, or important medical history"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <p className="text-sm text-yellow-800">
          This information will be shared with emergency services during SOS activation
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Save Emergency Profile
      </button>
    </div>
  );
}
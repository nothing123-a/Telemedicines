"use client";

import { useState } from "react";
import { Search, Leaf, Pill, ExternalLink, AlertTriangle } from "lucide-react";

export default function Ayurveda() {
  const [diseaseQuery, setDiseaseQuery] = useState("");
  const [medicineQuery, setMedicineQuery] = useState("");
  const [diseaseResults, setDiseaseResults] = useState([]);
  const [medicineResults, setMedicineResults] = useState([]);
  const [loadingDisease, setLoadingDisease] = useState(false);
  const [loadingMedicine, setLoadingMedicine] = useState(false);

  const searchByDisease = async (e) => {
    e.preventDefault();
    if (!diseaseQuery.trim()) return;
    
    setLoadingDisease(true);
    try {
      const response = await fetch(`/api/ayurveda?q=${encodeURIComponent(diseaseQuery)}&type=disease`);
      const data = await response.json();
      setDiseaseResults(data);
    } catch (error) {
      console.error('Error searching disease:', error);
      setDiseaseResults([]);
    } finally {
      setLoadingDisease(false);
    }
  };

  const searchByMedicine = async (e) => {
    e.preventDefault();
    if (!medicineQuery.trim()) return;
    
    setLoadingMedicine(true);
    try {
      const response = await fetch(`/api/ayurveda?q=${encodeURIComponent(medicineQuery)}&type=medicine`);
      const data = await response.json();
      setMedicineResults(data);
    } catch (error) {
      console.error('Error searching medicine:', error);
      setMedicineResults([]);
    } finally {
      setLoadingMedicine(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-orange-600 mb-4">
            🌿 AYUSH Knowledge Base
          </h1>
          <p className="text-gray-700 dark:text-gray-300">Discover Ayurvedic, Yoga, Unani, Siddha & Homeopathy remedies</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-orange-100 border-2 border-orange-400 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-orange-800 mb-1">Important Disclaimer</h3>
            <p className="text-orange-700 text-sm">
              This information is for educational purposes only. Always consult a qualified healthcare provider before replacing prescribed medicines or starting new treatments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search by Disease */}
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800">Search by Disease</h2>
            </div>

            <form onSubmit={searchByDisease} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={diseaseQuery}
                  onChange={(e) => setDiseaseQuery(e.target.value)}
                  placeholder="Enter disease name (e.g., Diabetes, Hypertension)"
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={loadingDisease}
                className="w-full mt-3 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loadingDisease ? 'Searching...' : 'Find Natural Remedies'}
              </button>
            </form>

            {loadingDisease && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Finding remedies...</p>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {diseaseResults.map((result, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">{result.title}</h3>
                  <p className="text-gray-700 text-sm mb-3">{result.snippet}</p>
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Learn More
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Search by Medicine */}
          <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-orange-800">Search by Medicine</h2>
            </div>

            <form onSubmit={searchByMedicine} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={medicineQuery}
                  onChange={(e) => setMedicineQuery(e.target.value)}
                  placeholder="Enter medicine name (e.g., Paracetamol, Aspirin)"
                  className="w-full pl-10 pr-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={loadingMedicine}
                className="w-full mt-3 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loadingMedicine ? 'Searching...' : 'Find Natural Alternatives'}
              </button>
            </form>

            {loadingMedicine && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Finding alternatives...</p>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {medicineResults.map((result, index) => (
                <div key={index} className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">{result.title}</h3>
                  <p className="text-gray-700 text-sm mb-3">{result.snippet}</p>
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Learn More
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AYUSH Categories Info */}
        <div className="mt-12 bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">AYUSH Systems of Medicine</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex-1 min-w-[200px] max-w-[220px] text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🌿</span>
              </div>
              <h3 className="font-semibold text-green-700 mb-2">Ayurveda</h3>
              <p className="text-xs text-gray-600">Ancient Indian medicine using herbs & lifestyle</p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-[220px] text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🧘</span>
              </div>
              <h3 className="font-semibold text-blue-700 mb-2">Yoga</h3>
              <p className="text-xs text-gray-600">Physical & mental wellness through poses</p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-[220px] text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🌙</span>
              </div>
              <h3 className="font-semibold text-purple-700 mb-2">Unani</h3>
              <p className="text-xs text-gray-600">Greek-Arabic medicine system</p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-[220px] text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⚗️</span>
              </div>
              <h3 className="font-semibold text-orange-700 mb-2">Siddha</h3>
              <p className="text-xs text-gray-600">Tamil traditional medicine</p>
            </div>
            <div className="flex-1 min-w-[200px] max-w-[220px] text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💊</span>
              </div>
              <h3 className="font-semibold text-red-700 mb-2">Homeopathy</h3>
              <p className="text-xs text-gray-600">Diluted natural substances</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
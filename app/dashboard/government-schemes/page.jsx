"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ExternalLink, Calendar, Building, Filter } from "lucide-react";

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('insurance');

  const categories = [
    { id: 'insurance', name: 'Maharashtra Health Insurance & Financial Protection' },
    { id: 'maternal', name: 'Maharashtra Maternal & Child Health' },
    { id: 'disease', name: 'Maharashtra Disease Control Programs' },
    { id: 'primary', name: 'Maharashtra Primary & Preventive Healthcare' },
    { id: 'nutrition', name: 'Maharashtra Nutrition & Anemia Control' },
    { id: 'ayush', name: 'Maharashtra Traditional & Alternative Medicine (AYUSH)' },
    { id: 'rural', name: 'Maharashtra Rural & Tribal Health' },
    { id: 'mental', name: 'Maharashtra Mental Health & Disability' }
  ];

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/health-news?category=${selectedCategory}&type=schemes`);
      const data = await response.json();
      setSchemes(data);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchemes();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 text-black dark:text-white p-3 sm:p-6 w-full overflow-x-hidden">
      <div className="max-w-full sm:max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
            🏛️ Maharashtra Government Health Schemes
          </h1>
          <p className="text-gray-700 dark:text-gray-300">Discover Maharashtra government healthcare schemes and programs for Mumbai region</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            <label className="text-base sm:text-lg font-semibold text-black">Filter by Scheme Type:</label>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-black rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:min-w-[300px] sm:w-auto"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mb-8">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-black rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-black ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading government schemes...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            {schemes.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600">No schemes found for this category.</p>
              </div>
            ) : (
              schemes.map((scheme, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 rounded-2xl bg-white backdrop-blur border-2 border-black hover:border-green-500 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-black group-hover:text-green-600 transition-colors flex-1">
                      {scheme.title}
                    </h2>
                    <a
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg border border-black hover:bg-green-600 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply
                    </a>
                  </div>
                  
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {scheme.snippet}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      {scheme.source && (
                        <span className="font-medium text-green-600">
                          {scheme.source}
                        </span>
                      )}
                      {scheme.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{scheme.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw, ExternalLink, Calendar, Globe, Filter } from "lucide-react";

export default function HealthNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');

  const fetchNews = async () => {
    try {
      setLoading(true);
      const url = `/api/health-news?category=${selectedCategory}&type=news`;
      
      const response = await fetch(url);
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const categories = [
    { id: 'general', name: 'Punjab General Health' },
    { id: 'mental', name: 'Punjab Mental Health' },
    { id: 'cardiology', name: 'Punjab Cardiology' },
    { id: 'diabetes', name: 'Punjab Diabetes Care' },
    { id: 'cancer', name: 'Punjab Cancer Treatment' },
    { id: 'pediatrics', name: 'Punjab Child Health' },
    { id: 'neurology', name: 'Punjab Neurology' },
    { id: 'orthopedics', name: 'Punjab Orthopedics' },
    { id: 'dermatology', name: 'Punjab Skin Care' },
    { id: 'gynecology', name: 'Punjab Women Health' },
    { id: 'ophthalmology', name: 'Punjab Eye Care' },
    { id: 'dentistry', name: 'Punjab Dental Care' },
    { id: 'nutrition', name: 'Punjab Nutrition' },
    { id: 'pharmacy', name: 'Punjab Pharmacy' },
    { id: 'emergency', name: 'Punjab Emergency Services' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 text-black dark:text-white p-3 sm:p-6 w-full overflow-x-hidden">
      <div className="max-w-full sm:max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            📰 Punjab Healthcare News
          </h1>
          <p className="text-gray-700 dark:text-gray-300">Stay updated with the latest healthcare and medical news from Punjab and Nabha region</p>
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            <label className="text-base sm:text-lg font-semibold text-black">Filter by Category:</label>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:min-w-[200px] sm:w-auto"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6 sm:mb-8">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-black rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw className={`w-5 h-5 text-black ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading latest Punjab healthcare news...</p>
          </div>
        )}

        {/* News Grid */}
        {!loading && (
          <div className="space-y-6">
            {news.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600">No news found for this category.</p>
              </div>
            ) : (
              news.map((article, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 rounded-2xl bg-white backdrop-blur border-2 border-black hover:border-blue-500 transition-all duration-300 group shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-black group-hover:text-blue-600 transition-colors flex-1">
                      {article.title}
                    </h2>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg border border-black hover:bg-blue-600 transition-colors text-sm self-start sm:self-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Read
                    </a>
                  </div>
                  
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {article.snippet}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      {article.source && (
                        <span className="font-medium text-blue-600">
                          {article.source}
                        </span>
                      )}
                      {article.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{article.date}</span>
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
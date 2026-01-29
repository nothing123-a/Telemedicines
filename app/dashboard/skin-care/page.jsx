"use client";

import { useState } from "react";
import { ArrowLeft, User, Calendar, Droplets, AlertCircle, Clock, Heart, Pill, Camera, ExternalLink } from "lucide-react";

export default function SkinCare() {
  const [step, setStep] = useState(1); // 1: Form, 2: Choice, 3: Results
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    skinType: '',
    concern: '',
    duration: '',
    lifestyle: '',
    medication: ''
  });
  const [recommendationType, setRecommendationType] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRecommendationChoice = async (type) => {
    setRecommendationType(type);
    setLoading(true);
    
    try {
      const response = await fetch('/api/skin-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recommendationType: type })
      });
      
      const data = await response.json();
      setRecommendations(data.recommendations);
      setStep(3);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      age: '', gender: '', skinType: '', concern: '', duration: '', lifestyle: '', medication: ''
    });
    setRecommendationType('');
    setRecommendations([]);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-pink-200 dark:border-gray-600">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-6">
              🌸 Skin Care Consultation
            </h1>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Droplets className="w-4 h-4" />
                  Skin Type
                </label>
                <select
                  value={formData.skinType}
                  onChange={(e) => handleInputChange('skinType', e.target.value)}
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                >
                  <option value="">Select Skin Type</option>
                  <option value="oily">Oily</option>
                  <option value="dry">Dry</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Main Concern
                </label>
                <select
                  value={formData.concern}
                  onChange={(e) => handleInputChange('concern', e.target.value)}
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                >
                  <option value="">Select Main Concern</option>
                  <option value="acne">Acne</option>
                  <option value="pigmentation">Pigmentation</option>
                  <option value="hair loss">Hair Loss</option>
                  <option value="dandruff">Dandruff</option>
                  <option value="eczema">Eczema</option>
                  <option value="psoriasis">Psoriasis</option>
                  <option value="wrinkles">Wrinkles/Aging</option>
                  <option value="dark circles">Dark Circles</option>
                  <option value="rashes">Rashes</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  Duration of Problem
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="few days">Few Days</option>
                  <option value="1-2 weeks">1-2 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="2-6 months">2-6 Months</option>
                  <option value="more than 6 months">More than 6 Months</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4" />
                  Lifestyle Factors
                </label>
                <textarea
                  value={formData.lifestyle}
                  onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                  placeholder="e.g., High stress, poor sleep, oily diet..."
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 h-20"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Pill className="w-4 h-4" />
                  Current Medication/Creams (Optional)
                </label>
                <input
                  type="text"
                  value={formData.medication}
                  onChange={(e) => handleInputChange('medication', e.target.value)}
                  placeholder="e.g., Tretinoin cream, Benzoyl peroxide..."
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Get Recommendations
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-200">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-pink-600 hover:text-pink-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Recommendations
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              Choose Your Recommendation Type
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleRecommendationChoice('home')}
                disabled={loading}
                className="p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-400 transition-all text-center disabled:opacity-50"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="font-semibold text-green-800 mb-2">Home Remedy</h3>
                <p className="text-sm text-gray-600">Natural DIY solutions using kitchen ingredients</p>
              </button>
              
              <button
                onClick={() => handleRecommendationChoice('dermatologist')}
                disabled={loading}
                className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-all text-center disabled:opacity-50"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <h3 className="font-semibold text-blue-800 mb-2">Dermatologist Recommended</h3>
                <p className="text-sm text-gray-600">OTC creams and medical treatments</p>
              </button>
              
              <button
                onClick={() => handleRecommendationChoice('ayurvedic')}
                disabled={loading}
                className="p-6 bg-orange-50 border-2 border-orange-200 rounded-xl hover:border-orange-400 transition-all text-center disabled:opacity-50"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="font-semibold text-orange-800 mb-2">Ayurvedic Products</h3>
                <p className="text-sm text-gray-600">Herbal and organic market products</p>
              </button>
            </div>
            
            {loading && (
              <div className="text-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Finding recommendations...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-200">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 text-pink-600 hover:text-pink-800"
              >
                <ArrowLeft className="w-4 h-4" />
                New Consultation
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {recommendationType === 'home' && '🏠 Home Remedies'}
                {recommendationType === 'dermatologist' && '👨‍⚕️ Dermatologist Recommended'}
                {recommendationType === 'ayurvedic' && '🌿 Ayurvedic Products'}
              </h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-gray-800 mb-2">Your Profile:</h3>
              <p className="text-sm text-gray-600">
                {formData.age} year old {formData.gender} with {formData.skinType} skin, 
                concerned about {formData.concern} for {formData.duration}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((item, index) => (
                <div key={index} className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 transition-all">
                  <h3 className="font-semibold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.snippet}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Learn More
                  </a>
                </div>
              ))}
            </div>
            
            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No recommendations found. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
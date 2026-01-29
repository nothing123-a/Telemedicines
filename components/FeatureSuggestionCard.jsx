'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeatureSuggestionCard({ suggestions, message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  if (!suggestions || suggestions.length === 0 || !isVisible) {
    return null;
  }

  const handleFeatureClick = (route) => {
    router.push(route);
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Suggested Features</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* AI Message */}
        {message && (
          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {message}
          </p>
        )}

        {/* Feature Cards */}
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.route}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleFeatureClick(suggestion.route)}
              className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {suggestion.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {suggestion.description}
                  </p>
                  {suggestion.relevanceReason && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      💡 {suggestion.relevanceReason}
                    </p>
                  )}
                </div>
                <svg 
                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-blue-100">
          <p className="text-xs text-gray-500 text-center">
            These suggestions are personalized based on your current needs
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
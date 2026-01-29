"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDark(true);
      applyDarkTheme();
    }
  }, []);

  const applyDarkTheme = () => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.documentElement.style.backgroundColor = '#111827';
    document.body.style.backgroundColor = '#111827';
    document.body.style.color = '#f9fafb';
  };

  const applyLightTheme = () => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.backgroundColor = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#111827';
  };

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    
    if (newDarkMode) {
      // Apply dark theme
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.backgroundColor = '#111827';
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#f9fafb';
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
      
      // Force all backgrounds to dark
      const bgSelectors = [
        '[class*="bg-white"]', '[class*="bg-gray-50"]', '[class*="bg-gray-100"]',
        '[class*="bg-emerald-50"]', '[class*="bg-blue-50"]', '[class*="bg-green-50"]',
        '[class*="bg-pink-50"]', '[class*="bg-purple-50"]', '[class*="bg-yellow-50"]',
        '[class*="bg-orange-50"]', '[class*="bg-red-50"]', '[class*="bg-teal-50"]',
        '[class*="bg-cyan-50"]', '[class*="bg-indigo-50"]', '[class*="bg-red-100"]',
        '[class*="bg-orange-100"]', '[class*="bg-indigo-100"]'
      ];
      
      bgSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.backgroundColor = '#1f2937';
          el.classList.add('js-dark-bg');
        });
      });
      
      // Force all text to light
      const textSelectors = [
        '[class*="text-black"]', '[class*="text-gray-900"]', '[class*="text-gray-800"]',
        '[class*="text-emerald-800"]', '[class*="text-blue-800"]', '[class*="text-green-800"]',
        '[class*="text-pink-800"]', '[class*="text-purple-800"]', '[class*="text-yellow-800"]',
        '[class*="text-orange-800"]', '[class*="text-red-800"]', '[class*="text-red-600"]',
        '[class*="text-red-700"]'
      ];
      
      textSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.color = '#f9fafb';
          el.classList.add('js-dark-text');
        });
      });
      
      // Force borders to dark
      document.querySelectorAll('[class*="border-"]').forEach(el => {
        el.style.borderColor = '#374151';
        el.classList.add('js-dark-border');
      });
      
      // Force gradients to dark
      document.querySelectorAll('[class*="bg-gradient-to"]').forEach(el => {
        el.style.background = 'linear-gradient(135deg, #111827, #1f2937)';
      });
      
    } else {
      // Apply light theme
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      localStorage.setItem('theme', 'light');
      setIsDark(false);
      
      // Reset ALL inline styles that were forced
      document.querySelectorAll('*').forEach(el => {
        // Remove all dark theme classes
        el.classList.remove('js-dark-bg', 'js-dark-text', 'js-dark-border');
        
        // Reset all inline styles
        if (el.style.backgroundColor && (el.style.backgroundColor.includes('#1f2937') || el.style.backgroundColor.includes('#111827'))) {
          el.style.backgroundColor = '';
        }
        if (el.style.color && el.style.color.includes('#f9fafb')) {
          el.style.color = '';
        }
        if (el.style.borderColor && el.style.borderColor.includes('#374151')) {
          el.style.borderColor = '';
        }
        if (el.style.background && el.style.background.includes('linear-gradient')) {
          el.style.background = '';
        }
      });
      
      // Force page refresh of styles
      document.body.offsetHeight;
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      style={{
        backgroundColor: isDark ? '#374151' : '#f3f4f6',
        color: isDark ? '#f9fafb' : '#111827'
      }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5" style={{ color: '#fbbf24' }} />
      ) : (
        <Moon className="w-5 h-5" style={{ color: '#6b7280' }} />
      )}
    </button>
  );
}
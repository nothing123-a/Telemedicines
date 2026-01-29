"use client";

import { useState } from 'react';

export default function GenieActivator({ onActivate }) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    // User interaction enables TTS
    const utterance = new SpeechSynthesisUtterance("Genie activated! Say Hey Genie to start.");
    speechSynthesis.speak(utterance);
    
    setIsActive(true);
    if (onActivate) onActivate();
  };

  if (isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleClick}
        className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
      >
        🧞♂️ Activate Genie
      </button>
    </div>
  );
}
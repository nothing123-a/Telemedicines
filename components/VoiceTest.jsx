"use client";

import { useState, useRef } from 'react';

export default function VoiceTest() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const startListening = async () => {
    try {
      // Test microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser');
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
        setTranscript('Listening...');
      };

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(`You said: "${result}"`);
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
      
    } catch (err) {
      setError(`Microphone error: ${err.message}`);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-lg border p-4 w-64 z-50">
      <h3 className="font-bold text-sm mb-2">🎤 Voice Test</h3>
      
      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full py-2 px-4 rounded text-white font-medium ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isListening ? 'Stop Listening' : 'Test Microphone'}
      </button>

      {transcript && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          {transcript}
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-xs">
          {error}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-600">
        Click "Test Microphone" and speak. If this works, Genie should too.
      </div>
    </div>
  );
}
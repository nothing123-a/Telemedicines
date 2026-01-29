"use client";

import { useState, useEffect, useRef } from 'react';

export default function InvisibleGenie() {
  const [isWakeWordActive, setIsWakeWordActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    initializeGenie();
    startWakeWordDetection();
    return () => cleanup();
  }, []);

  const initializeGenie = () => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // Default to English for user queries

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserQuery(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  };

  const startWakeWordDetection = () => {
    if (recognitionRef.current) {
      const wakeWordRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      wakeWordRecognition.continuous = true;
      wakeWordRecognition.interimResults = true;
      wakeWordRecognition.lang = 'en-US'; // Changed to English for better wake word detection

      wakeWordRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('Wake word detection:', transcript);
        
        // More flexible wake word matching
        if (transcript.includes('hey genie') || 
            transcript.includes('hi genie') ||
            transcript.includes('hey genius') ||
            transcript.includes('hey gini') ||
            transcript.includes('genie') ||
            transcript.includes('genius')) {
          console.log('Wake word detected!');
          wakeWordRecognition.stop();
          setIsWakeWordActive(false);
          activateGenie();
        }
      };

      wakeWordRecognition.onerror = () => {
        setTimeout(startWakeWordDetection, 1000);
      };

      wakeWordRecognition.start();
    }
  };

  const activateGenie = () => {
    console.log('Activating Genie...');
    setIsListening(true);
    
    speak("Hey! I am Genie. How can I assist you?");
    
    setTimeout(() => {
      if (recognitionRef.current) {
        console.log('Starting speech recognition for user query...');
        recognitionRef.current.start();
      }
    }, 3000);
  };

  const handleUserQuery = async (query) => {
    console.log('User query:', query);
    setIsProcessing(true);
    setIsListening(false);
    
    try {
      console.log('Sending to Gemini API...');
      const response = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      console.log('Gemini response:', data);
      
      if (data.success) {
        console.log('Speaking response:', data.response);
        speak(data.response);
      } else {
        console.error('API error:', data.error);
        speak('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('Request error:', error);
      speak('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        console.log('Restarting wake word detection...');
        setIsWakeWordActive(true);
        startWakeWordDetection();
      }, 4000);
    }
  };

  const speak = (text) => {
    console.log('Speaking:', text);
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const voices = synthRef.current.getVoices();
      const isHindi = /[\u0900-\u097F]/.test(text);
      
      if (isHindi) {
        const hindiVoice = voices.find(voice => 
          voice.lang.includes('hi') || voice.name.includes('Hindi')
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
          utterance.lang = 'hi-IN';
        }
      } else {
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en')
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = 'en-US';
        }
      }
      
      utterance.onstart = () => console.log('TTS started');
      utterance.onend = () => console.log('TTS ended');
      utterance.onerror = (e) => console.error('TTS error:', e);
      
      synthRef.current.speak(utterance);
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`w-4 h-4 rounded-full transition-all ${
        !isWakeWordActive && isListening ? 'bg-green-500 animate-pulse' : 
        isProcessing ? 'bg-yellow-500 animate-spin' :
        isWakeWordActive ? 'bg-red-500' : 'bg-gray-400'
      }`} />
    </div>
  );
}
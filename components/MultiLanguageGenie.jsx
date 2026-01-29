"use client";

import { useState, useEffect, useRef } from 'react';

export default function MultiLanguageGenie() {
  const [isWakeWordActive, setIsWakeWordActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const wakeWordRecognitionRef = useRef(null);

  useEffect(() => {
    initializeGenie();
    startWakeWordDetection();
    return () => cleanup();
  }, []);

  const initializeGenie = () => {
    // Initialize Speech Recognition for user queries
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('User query:', transcript);
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
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      wakeWordRecognitionRef.current = new SpeechRecognition();
      wakeWordRecognitionRef.current.continuous = true;
      wakeWordRecognitionRef.current.interimResults = true;
      wakeWordRecognitionRef.current.lang = 'en-US'; // English for wake word

      wakeWordRecognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('Wake word listening:', transcript);
        
        // Check for wake words
        if (transcript.includes('hey genie') || 
            transcript.includes('hi genie') ||
            transcript.includes('hey genius') ||
            transcript.includes('genie')) {
          console.log('✅ Wake word detected!');
          try {
            wakeWordRecognitionRef.current.stop();
          } catch (e) {
            console.log('Stop error:', e);
          }
          setIsWakeWordActive(false);
          activateGenie();
        }
      };

      wakeWordRecognitionRef.current.onerror = (event) => {
        console.log('Wake word error:', event.error);
        if (event.error !== 'aborted' && isWakeWordActive) {
          setTimeout(startWakeWordDetection, 2000);
        }
      };

      wakeWordRecognitionRef.current.onend = () => {
        if (isWakeWordActive) {
          setTimeout(startWakeWordDetection, 500);
        }
      };

      wakeWordRecognitionRef.current.start();
      console.log('🎤 Wake word detection started (English)');
    }
  };

  const activateGenie = () => {
    console.log('🧞♂️ Activating Genie...');
    setIsListening(true);
    
    speak("Hey! I am Genie. How can I assist you?");
    
    setTimeout(() => {
      if (recognitionRef.current) {
        console.log('🎤 Starting user query recognition...');
        recognitionRef.current.start();
      }
    }, 3000);
  };

  const handleUserQuery = async (query) => {
    console.log('📝 Processing query:', query);
    setIsProcessing(true);
    setIsListening(false);
    
    try {
      const response = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      console.log('🤖 Gemini response:', data);
      
      if (data.success) {
        speak(data.response);
      } else {
        speak('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      speak('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        console.log('🔄 Restarting wake word detection...');
        setIsWakeWordActive(true);
        startWakeWordDetection();
      }, 4000);
    }
  };

  const speak = (text) => {
    console.log('🔊 Speaking:', text);
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const voices = synthRef.current.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      );
      
      if (englishVoice) {
        utterance.voice = englishVoice;
        utterance.lang = 'en-US';
      }
      
      utterance.onstart = () => console.log('🔊 TTS started');
      utterance.onend = () => console.log('🔊 TTS ended');
      utterance.onerror = (e) => console.error('🔊 TTS error:', e);
      
      synthRef.current.speak(utterance);
    }
  };

  const cleanup = () => {
    setIsWakeWordActive(false);
    if (wakeWordRecognitionRef.current) {
      try {
        wakeWordRecognitionRef.current.stop();
      } catch (e) {
        console.log('Wake word cleanup error:', e);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition cleanup error:', e);
      }
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`w-5 h-5 rounded-full transition-all duration-300 ${ 
        isListening ? 'bg-green-500 animate-pulse shadow-lg' : 
        isProcessing ? 'bg-yellow-500 animate-spin shadow-lg' :
        isWakeWordActive ? 'bg-red-500 shadow-md' : 'bg-gray-400'
      }`} />
      
      {/* Status text */}
      <div className="absolute top-6 right-0 text-xs text-gray-600 whitespace-nowrap">
        {isListening ? 'Listening...' : 
         isProcessing ? 'Processing...' :
         isWakeWordActive ? 'Say "Hey Genie"' : 'Inactive'}
      </div>
    </div>
  );
}
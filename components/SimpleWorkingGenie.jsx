"use client";

import { useState, useEffect, useRef } from 'react';

export default function SimpleWorkingGenie() {
  const [status, setStatus] = useState('waiting'); // waiting, listening, processing
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    console.log('🧞♂️ Genie component mounted');
    testGenieAPI();
    initGenie();
    return () => {
      isActiveRef.current = false;
      cleanup();
    };
  }, []);

  const testGenieAPI = async () => {
    console.log('🧪 Testing Gemini API...');
    try {
      const response = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello, are you working?' }),
      });
      const data = await response.json();
      console.log('✅ Gemini API Response:', data);
      if (data.success) {
        console.log('🤖 Genie says:', data.response);
      } else {
        console.error('❌ API failed:', data.error);
        console.error('Details:', data.details);
        if (data.fallbackResponse) {
          console.log('🔄 Using fallback:', data.fallbackResponse);
        }
      }
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
    }
  };

  const initGenie = () => {
    console.log('🎤 Initializing Genie...');
    
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      console.log('✅ TTS supported');
    } else {
      console.error('❌ TTS not supported');
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('✅ STT supported');
      startWakeWordDetection();
    } else {
      console.error('❌ STT not supported');
    }
  };

  const startWakeWordDetection = () => {
    if (!isActiveRef.current) return;
    
    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('✅ Microphone permission granted');
        startRecognition();
      })
      .catch((error) => {
        console.error('❌ Microphone permission denied:', error);
        // Try without explicit permission
        startRecognition();
      });
  };
  
  const startRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('🎤 Wake word listening started');
      };
      
      recognition.onresult = (event) => {
        if (!isActiveRef.current) return;
        
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('🎤 Heard:', transcript);
        
        if (transcript.includes('hey genie') || transcript.includes('genie')) {
          console.log('✅ Wake word detected!');
          recognition.stop();
          activateGenie();
        }
      };
      
      recognition.onerror = (event) => {
        console.log('❌ Recognition error:', event.error);
        if (event.error !== 'aborted' && isActiveRef.current) {
          setTimeout(startWakeWordDetection, 2000);
        }
      };
      
      recognition.onend = () => {
        console.log('🎤 Recognition ended');
        if (isActiveRef.current && status === 'waiting') {
          setTimeout(startWakeWordDetection, 1000);
        }
      };
      
      recognition.start();
      console.log('🎤 Wake word detection active - Say "Hey Genie"');
      
    } catch (error) {
      console.error('Wake word setup failed:', error);
      setTimeout(startWakeWordDetection, 3000);
    }
  };

  const activateGenie = () => {
    console.log('🧞♂️ Activating Genie!');
    setStatus('listening');
    
    // Force TTS to work by user interaction
    const greeting = "Hey! I am Genie. How can I assist you?";
    speak(greeting);
    
    setTimeout(() => {
      startUserListening();
    }, 4000);
  };

  const startUserListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('User query:', transcript);
        handleQuery(transcript);
      };
      
      recognition.onerror = () => {
        setStatus('waiting');
        setTimeout(startWakeWordDetection, 1000);
      };
      
      recognition.onend = () => {
        if (status === 'listening') {
          setStatus('waiting');
          setTimeout(startWakeWordDetection, 1000);
        }
      };
      
      recognition.start();
      
    } catch (error) {
      console.error('User listening failed:', error);
      setStatus('waiting');
      setTimeout(startWakeWordDetection, 1000);
    }
  };

  const handleQuery = async (query) => {
    setStatus('processing');
    
    try {
      const response = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      
      if (data.success) {
        speak(data.response);
      } else {
        console.error('❌ API Error:', data.error, data.details);
        // Use fallback response if available
        const fallbackText = data.fallbackResponse || 'Sorry, I encountered an error.';
        speak(fallbackText);
      }
    } catch (error) {
      speak('Sorry, I encountered an error.');
    }
    
    setTimeout(() => {
      setStatus('waiting');
      startWakeWordDetection();
    }, 4000);
  };

  const speak = (text) => {
    console.log('🔊 Speaking:', text);
    if (synthRef.current && text) {
      synthRef.current.cancel();
      
      // Wait for voices to load
      const speakNow = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        
        // Get available voices
        const voices = synthRef.current.getVoices();
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
        );
        
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('🔊 Using voice:', englishVoice.name);
        }
        
        utterance.onstart = () => console.log('🔊 TTS started');
        utterance.onend = () => console.log('🔊 TTS ended');
        utterance.onerror = (e) => console.error('🔊 TTS error:', e);
        
        synthRef.current.speak(utterance);
      };
      
      // Ensure voices are loaded
      if (synthRef.current.getVoices().length === 0) {
        synthRef.current.onvoiceschanged = () => {
          speakNow();
        };
      } else {
        speakNow();
      }
    }
  };

  const cleanup = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`w-5 h-5 rounded-full transition-all shadow-lg ${
        status === 'listening' ? 'bg-green-500 animate-pulse' :
        status === 'processing' ? 'bg-yellow-500 animate-spin' :
        'bg-red-500'
      }`} />
      <div className="absolute top-6 right-0 text-xs text-gray-600 whitespace-nowrap">
        {status === 'listening' ? 'Listening...' :
         status === 'processing' ? 'Processing...' :
         'Say "Hey Genie"'}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from 'react';

export default function WorkingGenie() {
  const [status, setStatus] = useState('inactive'); // inactive, waiting, listening, processing
  const [isActivated, setIsActivated] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    console.log('🧞♂️ Genie auto-starting...');
    
    // Auto-activate after 2 seconds
    setTimeout(() => {
      activateGenie();
    }, 2000);
    
    return () => {
      isRunningRef.current = false;
      cleanup();
    };
  }, []);

  const activateGenie = async () => {
    console.log('🚀 Activating Genie...');
    
    // Initialize TTS
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Simple TTS enable
      
      // Test TTS
      testTTS();
    }
    
    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      
      setIsActivated(true);
      setStatus('waiting');
      startWakeWordDetection();
      
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setIsActivated(true);
      setStatus('waiting');
      startWakeWordDetection();
    }
  };

  const testTTS = () => {
    console.log('🔊 Force enabling TTS...');
    if (synthRef.current) {
      // Force enable TTS
      const utterance = new SpeechSynthesisUtterance('');
      synthRef.current.speak(utterance);
      synthRef.current.cancel();
      
      // Test with actual text
      const testUtterance = new SpeechSynthesisUtterance("Genie is ready!");
      testUtterance.volume = 1.0;
      testUtterance.rate = 0.8;
      testUtterance.onstart = () => console.log('🔊 ✅ TTS WORKING!');
      testUtterance.onerror = (e) => {
        console.log('🔊 TTS error:', e.error);
        alert('Genie is ready! (TTS fallback)');
      };
      synthRef.current.speak(testUtterance);
    }
  };

  const startWakeWordDetection = () => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
    }
    
    console.log('🎤 Starting wake word detection...');
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('🎤 Wake word detection STARTED');
        setStatus('waiting');
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('🎤 Heard:', transcript);
        
        if (transcript.includes('hey genie') || transcript.includes('genie')) {
          console.log('🎉 WAKE WORD DETECTED!');
          recognitionRef.current.stop();
          handleWakeWord();
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('🎤 Recognition error:', event.error);
        if (isRunningRef.current && event.error !== 'aborted') {
          setTimeout(startWakeWordDetection, 2000);
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('🎤 Recognition ended');
        if (isRunningRef.current && status === 'waiting') {
          setTimeout(startWakeWordDetection, 1000);
        }
      };
      
      recognitionRef.current.start();
      
    } catch (error) {
      console.error('❌ Failed to start recognition:', error);
    }
  };

  const handleWakeWord = () => {
    console.log('🧞♂️ Genie activated by wake word!');
    setStatus('listening');
    
    // Speak greeting
    speak("Hey! I am Genie. How can I assist you?");
    
    // Start listening for user query after greeting
    setTimeout(() => {
      startUserQuery();
    }, 4000);
  };

  const startUserQuery = () => {
    console.log('🎤 Starting user query listening...');
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const queryRecognition = new SpeechRecognition();
      
      queryRecognition.continuous = true;  // Keep listening
      queryRecognition.interimResults = true;  // Show interim results
      queryRecognition.lang = 'en-US';
      
      let finalTranscript = '';
      let lastSpeechTime = Date.now();
      let processingTimer = null;
      
      queryRecognition.onresult = (event) => {
        lastSpeechTime = Date.now();
        
        // Clear any existing processing timer
        if (processingTimer) {
          clearTimeout(processingTimer);
        }
        
        let interimTranscript = '';
        finalTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        const currentTranscript = finalTranscript + interimTranscript;
        console.log('🎤 Current speech:', currentTranscript);
        
        // Set timer to process after 3 seconds of no new speech
        processingTimer = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTime;
          if (timeSinceLastSpeech >= 2500 && currentTranscript.trim()) {
            console.log('📝 Processing complete speech:', currentTranscript.trim());
            queryRecognition.stop();
            handleUserQuery(currentTranscript.trim());
          }
        }, 3000);
      };
      
      queryRecognition.onerror = (event) => {
        console.log('❌ Query recognition error:', event.error);
        if (processingTimer) clearTimeout(processingTimer);
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          resetToWaiting();
        }
      };
      
      queryRecognition.onend = () => {
        console.log('🎤 Query recognition ended');
        if (processingTimer) clearTimeout(processingTimer);
      };
      
      queryRecognition.start();
      
      // Auto-stop after 20 seconds
      setTimeout(() => {
        console.log('⏰ Listening timeout, stopping...');
        if (processingTimer) clearTimeout(processingTimer);
        queryRecognition.stop();
        if (!finalTranscript.trim()) {
          speak('I didn\'t hear anything. Please try again.');
          setTimeout(resetToWaiting, 2000);
        }
      }, 20000);
      
    } catch (error) {
      console.error('❌ Failed to start query recognition:', error);
      resetToWaiting();
    }
  };

  const handleUserQuery = async (query) => {
    console.log('🧠 Processing query:', query);
    setStatus('processing');
    
    try {
      const response = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Got response:', data.response);
        speak(data.response);
      } else {
        console.error('❌ API error:', data.error);
        speak('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
      speak('Sorry, I encountered an error. Please try again.');
    }
    
    // Reset to waiting after response
    setTimeout(resetToWaiting, 5000);
  };

  const speak = (text) => {
    console.log('🔊 Speaking:', text);
    
    if (!window.ttsEnabled) {
      console.log('🔊 TTS not enabled - showing alert');
      alert('🧞♂️ Genie: ' + text);
      return;
    }
    
    if (!synthRef.current) {
      synthRef.current = window.speechSynthesis;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    utterance.onstart = () => console.log('🔊 ✅ VOICE PLAYING');
    utterance.onend = () => console.log('🔊 ✅ VOICE ENDED');
    utterance.onerror = (e) => {
      console.log('🔊 Voice error:', e.error);
      alert('🧞♂️ Genie: ' + text);
    };
    
    synthRef.current.speak(utterance);
  };

  const resetToWaiting = () => {
    console.log('🔄 Resetting to wake word detection...');
    setStatus('waiting');
    if (isRunningRef.current) {
      startWakeWordDetection();
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
    <>
      {/* Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`w-6 h-6 rounded-full transition-all shadow-lg ${
          status === 'listening' ? 'bg-green-500 animate-pulse' :
          status === 'processing' ? 'bg-yellow-500 animate-spin' :
          status === 'waiting' ? 'bg-red-500' :
          'bg-gray-400'
        }`} />
        <div className="absolute top-7 right-0 text-xs text-gray-600 whitespace-nowrap">
          {status === 'listening' ? 'Listening...' :
           status === 'processing' ? 'Processing...' :
           status === 'waiting' ? 'Say "Hey Genie"' :
           'Starting...'}
        </div>
      </div>
      
      {/* Audio Enable Button */}
      {!isActivated && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              // Enable TTS with user click
              window.ttsEnabled = true;
              const utterance = new SpeechSynthesisUtterance('Voice enabled');
              utterance.volume = 1.0;
              speechSynthesis.speak(utterance);
              activateGenie();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors animate-pulse"
          >
            🔊 Click to Enable Voice
          </button>
        </div>
      )}


    </>
  );
}
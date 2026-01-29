"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Zap } from 'lucide-react';

export default function EnhancedGenieAssistant() {
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const porcupineWorkerRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    initializeAssistant();
    return () => cleanup();
  }, []);

  const initializeAssistant = async () => {
    try {
      // Initialize Speech Recognition with multi-language support
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'hi-IN'; // Default to Hindi, will auto-detect

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          handleUserQuery(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          setError(`Speech recognition error: ${event.error}`);
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

      // Initialize Porcupine Wake Word Detection
      await initializePorcupine();
      
    } catch (error) {
      console.error('Failed to initialize assistant:', error);
      setError('Failed to initialize voice assistant');
    }
  };

  const initializePorcupine = async () => {
    try {
      // Load Porcupine scripts dynamically
      await loadPorcupineScripts();
      
      const accessKey = "6PYLS0t6bAGUrZriAoDXbgXTXjeBR4x2GQ/eiNybJ25XBkRStSfLFQ==";
      
      // Create Porcupine worker with custom Hey Genie keyword
      porcupineWorkerRef.current = await window.PorcupineWeb.PorcupineWorker.create(
        accessKey,
        ["/hey_genie.ppn"], // Direct path to keyword file
        (detection) => {
          console.log('🧞♂️ Hey Genie detected!', detection);
          activateGenie();
        }
      );

      // Start voice processing
      await window.WebVoiceProcessor.WebVoiceProcessor.subscribe(porcupineWorkerRef.current);
      
      setIsWakeWordActive(true);
      console.log('✅ Hey Genie wake word detection active');
      
    } catch (error) {
      console.error('Porcupine initialization failed:', error);
      // Fallback to simple keyword detection
      startSimpleWakeWordDetection();
    }
  };

  const loadPorcupineScripts = () => {
    return new Promise((resolve, reject) => {
      if (window.PorcupineWeb && window.WebVoiceProcessor) {
        resolve();
        return;
      }

      let scriptsLoaded = 0;
      const totalScripts = 2;

      const checkComplete = () => {
        scriptsLoaded++;
        if (scriptsLoaded === totalScripts) {
          resolve();
        }
      };

      // Load Porcupine Web
      if (!window.PorcupineWeb) {
        const porcupineScript = document.createElement('script');
        porcupineScript.src = 'https://unpkg.com/@picovoice/porcupine-web/dist/iife/index.js';
        porcupineScript.onload = checkComplete;
        porcupineScript.onerror = () => reject(new Error('Failed to load Porcupine Web'));
        document.head.appendChild(porcupineScript);
      } else {
        checkComplete();
      }

      // Load Web Voice Processor
      if (!window.WebVoiceProcessor) {
        const voiceProcessorScript = document.createElement('script');
        voiceProcessorScript.src = 'https://unpkg.com/@picovoice/web-voice-processor/dist/iife/index.js';
        voiceProcessorScript.onload = checkComplete;
        voiceProcessorScript.onerror = () => reject(new Error('Failed to load Web Voice Processor'));
        document.head.appendChild(voiceProcessorScript);
      } else {
        checkComplete();
      }
    });
  };

  const startSimpleWakeWordDetection = () => {
    // Fallback: Simple continuous recognition for wake word with multi-language
    if (recognitionRef.current) {
      const wakeWordRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      wakeWordRecognition.continuous = true;
      wakeWordRecognition.interimResults = true;
      wakeWordRecognition.lang = 'hi-IN'; // Multi-language detection

      wakeWordRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        // Multi-language wake words
        if (transcript.includes('hey genie') || 
            transcript.includes('hi genie') ||
            transcript.includes('हे जीनी') ||
            transcript.includes('हाय जीनी') ||
            transcript.includes('अरे जीनी') ||
            transcript.includes('हे जिनी')) {
          wakeWordRecognition.stop();
          activateGenie();
        }
      };

      wakeWordRecognition.start();
      setIsWakeWordActive(true);
      console.log('✅ Multi-language wake word detection active');
    }
  };

  const activateGenie = () => {
    setIsVisible(true);
    setIsListening(true);
    setTranscript('');
    setResponse('');
    setError('');
    
    // Multi-language greeting
    const greetings = [
      "Hi! I'm Genie. What can I help you with?",
      "नमस्ते! मैं जीनी हूं। मैं आपकी कैसे मदद कर सकती हूं?",
      "नमस्कार! मी जिनी आहे। मी तुमची कशी मदत करू शकते?"
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    speak(randomGreeting);
    
    // Start listening after greeting
    setTimeout(() => {
      if (recognitionRef.current) {
        // Set language based on browser/system preference
        const userLang = navigator.language || 'hi-IN';
        if (userLang.includes('hi') || userLang.includes('mr')) {
          recognitionRef.current.lang = 'hi-IN';
        } else {
          recognitionRef.current.lang = 'en-US';
        }
        recognitionRef.current.start();
      }
    }, 3000);
  };

  const handleUserQuery = async (query) => {
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
      
      if (data.success) {
        setResponse(data.response);
        // Use language from API response for better TTS
        speak(data.response, data.language);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      setError(errorMsg);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
      // Auto-hide after response
      setTimeout(() => {
        setIsVisible(false);
        // Resume wake word detection if using Porcupine
        if (!porcupineWorkerRef.current) {
          startSimpleWakeWordDetection();
        }
      }, 8000);
    }
  };

  const speak = (text, language = 'auto') => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Auto-detect language and select appropriate voice
      const voices = synthRef.current.getVoices();
      let selectedVoice = null;
      
      // Detect language from text
      const isHindi = /[\u0900-\u097F]/.test(text);
      const isMarathi = /[\u0900-\u097F]/.test(text); // Similar script
      
      if (isHindi || isMarathi) {
        // Find Hindi/Marathi voice
        selectedVoice = voices.find(voice => 
          voice.lang.includes('hi') || 
          voice.lang.includes('mr') ||
          voice.name.includes('Hindi') ||
          voice.name.includes('Marathi')
        );
        utterance.lang = 'hi-IN';
      } else {
        // Find English voice
        selectedVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.lang.startsWith('en')
        );
        utterance.lang = 'en-US';
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      synthRef.current.speak(utterance);
    }
  };

  const cleanup = async () => {
    try {
      if (porcupineWorkerRef.current && window.WebVoiceProcessor) {
        await window.WebVoiceProcessor.WebVoiceProcessor.unsubscribe(porcupineWorkerRef.current);
        porcupineWorkerRef.current.release();
        porcupineWorkerRef.current.terminate();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const toggleWakeWord = () => {
    if (isWakeWordActive) {
      cleanup();
      setIsWakeWordActive(false);
    } else {
      initializePorcupine();
    }
  };

  return (
    <>
      {/* Lightning Edge Indicator - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`relative flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-500 ${
          isWakeWordActive 
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {/* Lightning animation */}
          {isWakeWordActive && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse opacity-75"></div>
          )}
          
          <div className="relative flex items-center space-x-2">
            <Zap className={`w-4 h-4 ${isWakeWordActive ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isWakeWordActive ? 'Say "Hey Genie"' : 'Genie Off'}
            </span>
            <button
              onClick={toggleWakeWord}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              {isWakeWordActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Genie Assistant Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 transform transition-all duration-500 scale-100 animate-in slide-in-from-top-4">
            {/* Header with Genie Animation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ${
                  isListening ? 'animate-pulse' : ''
                }`}>
                  <span className="text-white text-xl">🧞♂️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Hey Genie</h3>
                  <p className="text-sm text-gray-500">
                    {isListening ? '🎤 Listening...' : 
                     isProcessing ? '🧠 Thinking...' : 
                     '✨ Ready to help'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {/* Voice Visualization */}
            {isListening && (
              <div className="flex items-center justify-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Processing Animation */}
            {isProcessing && (
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="text-gray-600">Processing your request...</span>
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">You said:</p>
                <p className="text-gray-800 font-medium">{transcript}</p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <p className="text-sm text-purple-600 mb-2">Genie says:</p>
                <p className="text-gray-800">{response}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600 mb-2">Error:</p>
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={activateGenie}
                disabled={isListening || isProcessing}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                <Mic size={18} />
                <span>Ask Again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
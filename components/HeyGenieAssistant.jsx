"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function HeyGenieAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    initializeVoiceAssistant();
    return () => cleanup();
  }, []);

  const initializeVoiceAssistant = () => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserQuery(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Start wake word detection
    startWakeWordDetection();
  };

  const startWakeWordDetection = async () => {
    try {
      // Simulate wake word detection (replace with actual Porcupine integration)
      setIsListening(true);
      
      // For demo purposes, we'll use a simple keyword detection
      // In production, integrate with Porcupine wake word detection
      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
          if (transcript.includes('hey genie') || transcript.includes('hi genie')) {
            activateGenie();
          }
        };
        recognitionRef.current.start();
      }
    } catch (error) {
      setError('Failed to start wake word detection');
    }
  };

  const activateGenie = () => {
    setIsVisible(true);
    setIsRecording(true);
    setTranscript('');
    setResponse('');
    
    // Play activation sound or animation
    speak("Hi! I'm Genie. How can I help you?");
    
    // Start listening for user query
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.start();
      }, 2000); // Wait for greeting to finish
    }
  };

  const handleUserQuery = async (query) => {
    setIsProcessing(true);
    setIsRecording(false);
    
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
        speak(data.response);
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
        startWakeWordDetection(); // Resume wake word detection
      }, 5000);
    }
  };

  const speak = (text) => {
    if (synthRef.current && text) {
      synthRef.current.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
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

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startWakeWordDetection();
    }
  };

  return (
    <>
      {/* Wake Word Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg transition-all duration-300 ${
          isListening ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium">
            {isListening ? 'Listening for "Hey Genie"' : 'Wake word off'}
          </span>
          <button
            onClick={toggleListening}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
        </div>
      </div>

      {/* Genie Assistant Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🧞♂️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Hey Genie</h3>
                  <p className="text-sm text-gray-500">
                    {isRecording ? 'Listening...' : isProcessing ? 'Thinking...' : 'Ready'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Status Indicator */}
            <div className="mb-4">
              {isRecording && (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Listening to your question...</span>
                </div>
              )}
              
              {isProcessing && (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-600">Processing your request...</span>
                </div>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-gray-800">{transcript}</p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Genie says:</p>
                <p className="text-gray-800">{response}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 mb-1">Error:</p>
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={activateGenie}
                disabled={isRecording || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Mic size={16} />
                <span>Ask Again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
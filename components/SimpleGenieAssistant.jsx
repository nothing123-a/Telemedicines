"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Zap } from 'lucide-react';

export default function SimpleGenieAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    initializeAssistant();
    startWakeWordDetection();
    return () => cleanup();
  }, []);

  const initializeAssistant = () => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleUserQuery(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
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
      wakeWordRecognition.lang = 'hi-IN';

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

      wakeWordRecognition.onerror = () => {
        // Restart on error
        setTimeout(startWakeWordDetection, 1000);
      };

      wakeWordRecognition.start();
      console.log('✅ Wake word detection active');
    }
  };

  const activateGenie = () => {
    setIsVisible(true);
    setIsListening(true);
    setTranscript('');
    setResponse('');
    
    // Multi-language greeting
    const greetings = [
      "Hi! I'm Genie. How can I help you?",
      "नमस्ते! मैं जीनी हूं। मैं आपकी कैसे मदद कर सकती हूं?",
      "नमस्कार! मी जिनी आहे। मी तुमची कशी मदत करू शकते?"
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    speak(randomGreeting);
    
    // Start listening after greeting
    setTimeout(() => {
      if (recognitionRef.current) {
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
        speak(data.response);
        
        // Handle doctor connection if requested
        if (data.action === 'CONNECT_TO_DOCTOR') {
          await handleDoctorConnection(data.doctorConnection);
        } else if (data.action === 'ASK_CONNECTION_TYPE') {
          // Keep listening for chat/video response
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 2000);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
      // Auto-hide and restart wake word detection
      setTimeout(() => {
        setIsVisible(false);
        startWakeWordDetection();
      }, 5000);
    }
  };

  const handleDoctorConnection = async (doctorConnection) => {
    try {
      // Get user info from session/localStorage or use defaults
      const userId = localStorage.getItem('userId') || 'genie-user-' + Date.now();
      const userName = localStorage.getItem('userName') || 'Genie User';
      const userEmail = localStorage.getItem('userEmail') || 'user@minds.com';
      
      // Step 1: Create routine doctor request (what user normally does manually)
      const requestResponse = await fetch('/api/routine-doctor/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
          userEmail,
          connectionType: 'chat', // Default to chat
          note: 'Genie automated request - User requested doctor connection',
          timestamp: new Date().toISOString()
        }),
      });

      const requestData = await requestResponse.json();
      
      if (requestData.success) {
        const successMsg = "Perfect! I've sent your request to available doctors. You'll be connected shortly.";
        speak(successMsg);
        setResponse(successMsg + " Please wait while I find an available doctor for you.");
        
        // Step 2: Start polling for doctor acceptance (automate the waiting process)
        pollForDoctorAcceptance(requestData.requestId);
      } else {
        throw new Error(requestData.error || 'Failed to create doctor request');
      }
    } catch (error) {
      const errorMsg = 'Sorry, I could not connect you to a doctor right now. Please try again later.';
      speak(errorMsg);
      setResponse(errorMsg);
    }
  };

  const pollForDoctorAcceptance = async (requestId) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/routine-doctor/status?requestId=${requestId}`);
        const data = await response.json();
        
        if (data.status === 'accepted' && data.roomId) {
          const connectedMsg = "Great news! A doctor has accepted your request. Connecting you now...";
          speak(connectedMsg);
          setResponse(connectedMsg);
          
          // Auto-redirect to the chat/video room
          setTimeout(() => {
            window.location.href = `/${data.connectionType}-room/${data.roomId}`;
          }, 2000);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          const timeoutMsg = "No doctors are available right now. Please try again later.";
          speak(timeoutMsg);
          setResponse(timeoutMsg);
        }
      } catch (error) {
        console.error('Error checking doctor status:', error);
      }
    };
    
    checkStatus();
  };

  const speak = (text) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Auto-detect language and select voice
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
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = 'en-US';
        }
      }
      
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
    <>
      {/* Lightning Edge Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <Zap className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">Genie Active</span>
        </div>
      </div>

      {/* Genie Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ${
                  isListening ? 'animate-pulse' : ''
                }`}>
                  <span className="text-white text-xl">🧞♂️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Genie</h3>
                  <p className="text-sm text-gray-500">
                    {isListening ? '🎤 Listening...' : 
                     isProcessing ? '🧠 Thinking...' : 
                     '✨ Ready'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
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

            {/* Processing */}
            {isProcessing && (
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="text-gray-600">Processing...</span>
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
                {response.includes('doctor') && (
                  <div className="mt-3 p-2 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">🩺 Automated Doctor Request Sent</p>
                    <div className="flex items-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></div>
                      <span className="text-xs text-green-600">Waiting for doctor...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center">
              <button
                onClick={activateGenie}
                disabled={isListening || isProcessing}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all"
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
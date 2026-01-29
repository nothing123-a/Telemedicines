"use client";

import { useState, useRef, useEffect } from 'react';

export default function MultilingualGenieAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [voiceResponse, setVoiceResponse] = useState(true);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    initializeMultilingualSpeech();
    startMultilingualWakeWord();
    
    return () => cleanup();
  }, []);

  const initializeMultilingualSpeech = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 3;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          detectLanguageAndProcess(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          switchLanguageAndRetry();
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  };

  const startMultilingualWakeWord = () => {
    const languages = ['hi-IN', 'mr-IN', 'pa-IN', 'en-IN', 'en-US'];
    let currentLangIndex = 0;
    
    const startRecognitionWithLanguage = (lang) => {
      if (recognitionRef.current) {
        const wakeWordRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        wakeWordRecognition.continuous = true;
        wakeWordRecognition.interimResults = true;
        wakeWordRecognition.lang = lang;
        
        wakeWordRecognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
          
          const wakeWords = [
            'hey genie', 'hi genie', 'genie',
            'हे जीनी', 'हाय जीनी', 'जीनी',
            'हे जिनी', 'नमस्कार जिनी',
            'ਹੇ ਜੀਨੀ', 'ਹਾਏ ਜੀਨੀ', 'ਜੀਨੀ'
          ];
          
          if (wakeWords.some(word => transcript.includes(word))) {
            wakeWordRecognition.stop();
            activateGenie(lang);
          }
        };
        
        wakeWordRecognition.onerror = () => {
          currentLangIndex = (currentLangIndex + 1) % languages.length;
          setTimeout(() => startRecognitionWithLanguage(languages[currentLangIndex]), 1000);
        };
        
        wakeWordRecognition.start();
        console.log(`✅ Wake word detection active for ${lang}`);
      }
    };
    
    startRecognitionWithLanguage(languages[currentLangIndex]);
  };

  const switchLanguageAndRetry = () => {
    const languages = ['hi-IN', 'mr-IN', 'pa-IN', 'en-IN'];
    const currentLang = recognitionRef.current.lang;
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    
    recognitionRef.current.lang = languages[nextIndex];
    console.log(`🔄 Switching to language: ${languages[nextIndex]}`);
    
    setTimeout(() => {
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }, 500);
  };

  const detectLanguageAndProcess = async (text) => {
    setIsProcessing(true);
    
    let detectedLang = 'en';
    if (/[\u0900-\u097F]/.test(text)) {
      if (text.includes('आहे') || text.includes('का') || text.includes('ते')) {
        detectedLang = 'mr';
      } else {
        detectedLang = 'hi';
      }
    } else if (/[\u0A00-\u0A7F]/.test(text)) {
      detectedLang = 'pa';
    }
    
    setDetectedLanguage(detectedLang);
    
    const newMessage = { type: 'user', text, language: detectedLang };
    setChatHistory(prev => [...prev, newMessage]);
    
    try {
      const response = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          language: detectedLang 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResponse(data.response);
        const botMessage = { type: 'bot', text: data.response, language: detectedLang };
        setChatHistory(prev => [...prev, botMessage]);
        
        if (voiceResponse) {
          speakInDetectedLanguage(data.response, detectedLang);
        }
      }
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMsg = getErrorMessage(detectedLang);
      setResponse(errorMsg);
      const errorMessage = { type: 'bot', text: errorMsg, language: detectedLang };
      setChatHistory(prev => [...prev, errorMessage]);
      
      if (voiceResponse) {
        speakInDetectedLanguage(errorMsg, detectedLang);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getErrorMessage = (lang) => {
    const messages = {
      'hi': 'माफ करें, मुझे कोई समस्या हुई है। कृपया फिर से कोशिश करें।',
      'mr': 'माफ करा, मला काही समस्या आली आहे. कृपया पुन्हा प्रयत्न करा.',
      'pa': 'ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਕੋਈ ਸਮੱਸਿਆ ਆਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      'en': 'Sorry, I encountered an error. Please try again.'
    };
    return messages[lang] || messages['en'];
  };

  const activateGenie = (detectedLang) => {
    setShowChat(true);
    setIsMinimized(false);
    setIsListening(true);
    setTranscript('');
    setResponse('');
    setDetectedLanguage(detectedLang);
    
    const greetings = {
      'hi': 'नमस्ते! मैं जीनी हूं। मैं आपकी कैसे मदद कर सकती हूं?',
      'mr': 'नमस्कार! मी जिनी आहे। मी तुमची कशी मदत करू शकते?',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਜੀਨੀ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?',
      'en': "Hi! I'm Genie. How can I help you?"
    };
    
    const greeting = greetings[detectedLang] || greetings['en'];
    const greetingMessage = { type: 'bot', text: greeting, language: detectedLang };
    setChatHistory(prev => [...prev, greetingMessage]);
    
    if (voiceResponse) {
      speakInDetectedLanguage(greeting, detectedLang);
    }
    
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.lang = getRecognitionLanguage(detectedLang);
        recognitionRef.current.start();
      }
    }, 2000);
  };

  const getRecognitionLanguage = (lang) => {
    const langMap = {
      'hi': 'hi-IN',
      'mr': 'mr-IN', 
      'pa': 'pa-IN',
      'en': 'en-IN'
    };
    return langMap[lang] || 'en-IN';
  };

  const speakInDetectedLanguage = (text, lang) => {
    if (synthRef.current && text && voiceResponse) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.4;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      const voices = synthRef.current.getVoices();
      let selectedVoice = null;
      
      switch (lang) {
        case 'hi':
          selectedVoice = voices.find(voice => 
            voice.lang.includes('hi') || 
            voice.name.toLowerCase().includes('hindi')
          );
          utterance.lang = 'hi-IN';
          break;
        case 'mr':
          selectedVoice = voices.find(voice => 
            voice.lang.includes('mr') || 
            voice.name.toLowerCase().includes('marathi')
          );
          utterance.lang = 'mr-IN';
          break;
        case 'pa':
          selectedVoice = voices.find(voice => 
            voice.lang.includes('pa') || 
            voice.name.toLowerCase().includes('punjabi')
          );
          utterance.lang = 'pa-IN';
          break;
        default:
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.lang.includes('IN')
          );
          utterance.lang = 'en-IN';
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const closeChat = () => {
    setShowChat(false);
    setChatHistory([]);
    cleanup();
    startMultilingualWakeWord();
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const restoreChat = () => {
    setIsMinimized(false);
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
      {/* Genie Dropdown Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="text-2xl">🧞♂️</span>
          </button>
          
          {showDropdown && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-2xl border p-2 min-w-48 z-[10000]">
              <div className="text-center text-sm text-gray-600 mb-2 px-3 py-2 bg-gray-50 rounded">
                Say "Hey Genie"
              </div>
              <button
                onClick={() => {
                  setShowChat(true);
                  setIsMinimized(false);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded"
              >
                <span>💬</span>
                <span>Chat</span>
              </button>
              <button
                onClick={() => {
                  startListening();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded"
              >
                <span>▶️</span>
                <span>Start Voice</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Minimized Chat Indicator */}
      {isMinimized && (
        <div className="fixed bottom-20 right-6 z-50">
          <button
            onClick={restoreChat}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            <span className="text-sm">💬 Genie Chat</span>
          </button>
        </div>
      )}

      {/* Chat Box */}
      {showChat && !isMinimized && (
        <div className="fixed bottom-6 right-20 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🧞♂️</span>
              <span className="font-medium">Genie ({detectedLanguage.toUpperCase()})</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={minimizeChat}
                className="p-1 hover:bg-white/20 rounded"
              >
                ➖
              </button>
              <button
                onClick={closeChat}
                className="p-1 hover:bg-white/20 rounded"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                Say "Hey Genie" or click the voice button to start
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Options & Status */}
          <div className="p-3 border-t bg-gray-50 rounded-b-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Response Mode:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setVoiceResponse(true)}
                  className={`px-2 py-1 rounded text-xs ${
                    voiceResponse
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Voice
                </button>
                <button
                  onClick={() => setVoiceResponse(false)}
                  className={`px-2 py-1 rounded text-xs ${
                    !voiceResponse
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Text Only
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {isListening ? '🎤 Listening...' : 'Ready'}
              </div>
              <button
                onClick={startListening}
                disabled={isListening}
                className={`px-3 py-1 rounded text-xs ${
                  isListening
                    ? 'bg-red-100 text-red-600 cursor-not-allowed'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {isListening ? 'Listening...' : 'Start Voice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Indicator */}
      <div className="fixed top-4 left-4 z-40">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-2 rounded-full shadow-lg">
          <span className="text-sm font-medium">
            🌐 Multilingual Genie ({detectedLanguage.toUpperCase()})
          </span>
        </div>
      </div>
    </>
  );
}
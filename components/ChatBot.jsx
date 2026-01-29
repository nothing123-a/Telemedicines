"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useEscalate } from "@/lib/hooks/useEscalate";
import MusicModal from "@/components/MusicModal";
import DoctorConnectionModal from "@/components/DoctorConnectionModal";
import { Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";

import { io } from "socket.io-client";

export default function ChatBot({ onSessionSave }) {
  const { data: session } = useSession();
  const { escalate, loading: escalating, doctor, error } = useEscalate();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! 👋 I'm here for you. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [musicName, setMusicName] = useState("");
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);

  const [socket, setSocket] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', voice: 'en-US' },
    { code: 'hi', name: 'हिंदी', voice: 'hi-IN' },
    { code: 'es', name: 'Español', voice: 'es-ES' }
  ];

  const saveChatSession = async (messages) => {
    if (!session?.user?.id || messages.length < 2) return;
    
    try {
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          messages: messages.map(msg => ({
            ...msg,
            timestamp: new Date()
          }))
        })
      });
      
      if (onSessionSave) {
        onSessionSave();
      }
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        setRecognition(recognitionInstance);
      }
      setSynthesis(window.speechSynthesis);
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Poll for escalation request status
  useEffect(() => {
    if (!isPolling || !currentRequestId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/escalate/status/${currentRequestId}`);
        const data = await response.json();
        
        if (data.status === "accepted") {
          setDoctorInfo({
            requestId: currentRequestId,
            doctorId: data.doctorId,
            doctorName: data.doctorName
          });
          setShowMusicModal(false); // Close music modal
          setShowDoctorModal(true);
          setIsPolling(false);
          clearInterval(pollInterval);
        } else if (data.status === "rejected") {
          let rejectedMessage = "The doctor is currently unavailable. I'm here to continue supporting you. Let's keep talking - what would help you feel better right now?";
          
          if (selectedLang !== 'en') {
            rejectedMessage = await translateText(rejectedMessage, selectedLang);
          }
          
          setMessages(prev => [...prev, {
            role: "assistant",
            content: rejectedMessage
          }]);
          speakText(rejectedMessage);
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, currentRequestId]);

  useEffect(() => {
    if (session?.user?.id) {
      const newSocket = io();
      setSocket(newSocket);

      // Register user with their ID for other socket features
      newSocket.emit("register-user", { userId: session.user.id });

      // Listen for doctor acceptance
      newSocket.on("doctor-accepted", (data) => {
        console.log('📨 Received doctor-accepted:', data);
        setDoctorInfo({
          requestId: data.requestId,
          doctorId: data.doctorId,
          doctorName: data.doctorName
        });
        setShowMusicModal(false);
        setShowDoctorModal(true);
        setIsPolling(false);
        if (synthesis) {
          synthesis.cancel();
          setIsSpeaking(false);
        }
      });

      // Fallback listener for broadcast events
      newSocket.on("doctor-accepted-broadcast", (data) => {
        console.log('📨 Received doctor-accepted-broadcast:', data);
        console.log('📨 Session user ID:', session.user.id);
        console.log('📨 Target user ID:', data.targetUserId);
        console.log('📨 Target Google ID:', data.targetGoogleId);
        
        if (data.targetUserId === session.user.id || data.targetGoogleId === session.user.id) {
          console.log('🎉 Match found! Showing doctor modal');
          setDoctorInfo({
            requestId: data.requestId,
            doctorId: data.doctorId,
            doctorName: data.doctorName
          });
          setShowMusicModal(false); // Close music modal
          setShowDoctorModal(true);
          setIsPolling(false);
        }
      });

      // Listen for connection acceptance
      newSocket.on("connection-accepted", ({ roomId, connectionType }) => {
        // Redirect patient to room
        window.location.href = `/${connectionType}-room/${roomId}`;
      });

      // Listen for no doctors available
      newSocket.on("no-doctors-available", async ({ message }) => {
        let translatedMessage = `⚠️ ${message}\n\nDon't worry, I'm still here with you. Let's continue talking - I want to help you through this. What's on your mind right now?`;
        
        if (selectedLang !== 'en') {
          translatedMessage = await translateText(translatedMessage, selectedLang);
        }
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: translatedMessage
        }]);
        speakText(translatedMessage);
      });

      return () => {
        newSocket.disconnect();
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [session?.user?.id]);

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang })
      });
      const data = await res.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const speakText = (text) => {
    if (!synthesis || isSpeaking || isMusicPlaying) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = languages.find(l => l.code === selectedLang);
    utterance.lang = lang?.voice || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthesis.speak(utterance);
  };

  const handleMusicPlay = () => {
    setIsMusicPlaying(true);
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleMusicStop = () => {
    setIsMusicPlaying(false);
  };

  const startListening = () => {
    if (!recognition) return;
    
    const lang = languages.find(l => l.code === selectedLang);
    recognition.lang = lang?.voice || 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      let finalText = transcript;
      
      if (selectedLang !== 'en') {
        finalText = await translateText(transcript, 'en');
      }
      
      setInput(finalText);
    };
    
    recognition.start();
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let userMessage = input;
    let displayMessage = input;
    
    // If user selected non-English language, translate their English input to selected language for display
    if (selectedLang !== 'en') {
      displayMessage = await translateText(input, selectedLang);
    }

    const newMessages = [...messages, { role: "user", content: displayMessage, timestamp: new Date().toISOString() }];
    setMessages(newMessages);
    setInput("");

    // Always send original English text to AI for processing
    const res = await fetch("/api/gemini-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        messages: [...messages, { role: "user", content: userMessage }],
        userId: session?.user?.id
      }),
    });

    const data = await res.json();
    let aiReply = data.reply;
    
    if (selectedLang !== 'en') {
      aiReply = await translateText(data.reply, selectedLang);
    }
    
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: aiReply, timestamp: new Date().toISOString() },
    ]);

    speakText(aiReply);

    if (data.moodMusic) {
      setMusicUrl(data.moodMusic.url);
      setMusicName(data.moodMusic.name);
      setShowMusicModal(true);
    }

    if (data.escalate === true) {
      let suicidalContent = "🚨 I've detected you might need immediate help. I'm connecting you with a doctor right now. Please hold on...";
      if (selectedLang !== 'en') {
        suicidalContent = await translateText(suicidalContent, selectedLang);
      }
      
      const suicidalMessage = { 
        role: "assistant", 
        content: suicidalContent,
        isSuicidalDetection: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, suicidalMessage]);
      speakText(suicidalContent);
      
      // The escalation is already triggered in the gemini-chat API
      // Just start polling for doctor response
      console.log('🚨 Escalation detected, starting polling...');
      
      await saveChatSession([...messages, { role: "user", content: userMessage }, suicidalMessage]);
    } else {
      await saveChatSession([...messages, { role: "user", content: userMessage }, { role: "assistant", content: data.reply }]);
    }
  };



  return (
    <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-gradient-to-b from-emerald-50 to-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-emerald-500 text-lg">🧠</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{selectedLang === 'hi' ? 'मानसिक स्वास्थ्य सहायक' : 'Mental Health Assistant'}</h3>
            <p className="text-emerald-100 text-sm">{selectedLang === 'hi' ? 'आपकी सुनने के लिए यहाँ हूँ' : 'Here to listen and support you'}</p>
          </div>
          <div className="ml-auto">
            {isSpeaking && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm">{selectedLang === 'hi' ? 'बोल रहा है...' : 'Speaking...'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-emerald-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`p-4 rounded-2xl shadow-md ${msg.role === 'assistant' 
                ? 'bg-white border border-emerald-100 text-gray-800' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
              } ${msg.role === 'assistant' ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.isSuicidalDetection && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">🚨 {selectedLang === 'hi' ? 'आपातकालीन सहायता सक्रिय' : 'Emergency Support Activated'}</p>
                  </div>
                )}
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center ml-3 shadow-lg flex-shrink-0">
                <span className="text-white text-sm">👤</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-emerald-100 p-4">
        {/* Controls Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
              <Globe className="w-4 h-4 text-emerald-600" />
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-sm font-medium text-emerald-700 border-none outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={isSpeaking ? stopSpeaking : () => {}}
            className={`p-2 rounded-full transition-all ${isSpeaking ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Input Row */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder={selectedLang === 'hi' ? 'अपनी भावनाएं साझा करें...' : 'Share your feelings...'}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
              <button
                onClick={isListening ? () => recognition?.stop() : startListening}
                disabled={!recognition}
                className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white hover:bg-emerald-600'} disabled:opacity-50`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSend}
            disabled={escalating || !input.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {escalating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Helpful Tips */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          {selectedLang === 'hi' ? '💡 आप टाइप कर सकते हैं या माइक बटन दबाकर बोल सकते हैं' : '💡 You can type or click the mic to speak'}
        </div>
      </div>



      <MusicModal
        open={showMusicModal}
        onClose={() => {
          setShowMusicModal(false);
          setIsMusicPlaying(false);
        }}
        url={musicUrl}
        name={musicName}
        onPlay={handleMusicPlay}
        onPause={handleMusicStop}
        onEnded={handleMusicStop}
      />

      <DoctorConnectionModal
        isOpen={showDoctorModal}
        onClose={() => {
          setShowDoctorModal(false);
          if (synthesis) {
            synthesis.cancel();
            setIsSpeaking(false);
          }
        }}
        doctorName={doctorInfo?.doctorName}
        requestId={doctorInfo?.requestId}
      />


    </div>
  );
}
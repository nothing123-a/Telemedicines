"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useEscalate } from "@/lib/hooks/useEscalate";
import MusicModal from "@/components/MusicModal";
import DoctorConnectionModal from "@/components/DoctorConnectionModal";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Globe, 
  Send,
  Bot,
  User,
  AlertTriangle,
  Music,
  Phone,
  Smile,
  Heart,
  Shield
} from "lucide-react";
import { io } from "socket.io-client";

export default function ModernChatInterface({ onSessionSave }) {
  const { data: session } = useSession();
  const { escalate, loading: escalating, doctor, error } = useEscalate();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! 👋 I'm your AI mental health companion. I'm here to listen, support, and help you through whatever you're experiencing. How are you feeling today?",
      timestamp: new Date().toISOString()
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
  const [isTyping, setIsTyping] = useState(false);

  const [socket, setSocket] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', voice: 'en-US', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', voice: 'hi-IN', flag: '🇮🇳' },
    { code: 'es', name: 'Español', voice: 'es-ES', flag: '🇪🇸' }
  ];

  const quickResponses = [
    { text: "I'm feeling anxious", emoji: "😰" },
    { text: "I need someone to talk to", emoji: "💬" },
    { text: "I'm having a bad day", emoji: "😔" },
    { text: "I feel overwhelmed", emoji: "😵" }
  ];

  // Auto-scroll to bottom only for new messages, not on load
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Initialize speech recognition and synthesis
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

  // Socket and polling logic (keeping existing functionality)
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
          setShowMusicModal(false);
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
            content: rejectedMessage,
            timestamp: new Date().toISOString()
          }]);
          speakText(rejectedMessage);
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isPolling, currentRequestId]);

  // Socket initialization (keeping existing functionality)
  useEffect(() => {
    if (session?.user?.id) {
      const newSocket = io();
      setSocket(newSocket);

      newSocket.emit("register-user", { userId: session.user.id });

      newSocket.on("doctor-accepted", (data) => {
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

      newSocket.on("doctor-accepted-broadcast", (data) => {
        if (data.targetUserId === session.user.id || data.targetGoogleId === session.user.id) {
          setDoctorInfo({
            requestId: data.requestId,
            doctorId: data.doctorId,
            doctorName: data.doctorName
          });
          setShowMusicModal(false);
          setShowDoctorModal(true);
          setIsPolling(false);
        }
      });

      newSocket.on("connection-accepted", ({ roomId, connectionType }) => {
        window.location.href = `/${connectionType}-room/${roomId}`;
      });

      newSocket.on("no-doctors-available", async ({ message }) => {
        let translatedMessage = `⚠️ ${message}\n\nDon't worry, I'm still here with you. Let's continue talking - I want to help you through this. What's on your mind right now?`;
        
        if (selectedLang !== 'en') {
          translatedMessage = await translateText(translatedMessage, selectedLang);
        }
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: translatedMessage,
          timestamp: new Date().toISOString()
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

  const saveChatSession = async (messages) => {
    if (!session?.user?.email || messages.length < 2) return;
    
    try {
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          userEmail: session.user.email,
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

  const handleQuickResponse = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let userMessage = input;
    let displayMessage = input;
    
    if (selectedLang !== 'en') {
      displayMessage = await translateText(input, selectedLang);
    }

    const newMessages = [...messages, { 
      role: "user", 
      content: displayMessage, 
      timestamp: new Date().toISOString() 
    }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
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
        { 
          role: "assistant", 
          content: aiReply, 
          timestamp: new Date().toISOString(),
          riskLevel: data.riskAnalysis?.level
        },
      ]);

      speakText(aiReply);

      if (data.moodMusic) {
        setMusicUrl(data.moodMusic.url);
        setMusicName(data.moodMusic.name);
        setShowMusicModal(true);
      }

      if (data.escalate === true && session?.user?.email) {
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
        
        const result = await escalate(session.user.email);
        if (result?.requestId) {
          setCurrentRequestId(result.requestId);
          setIsPolling(true);
        }
        
        await saveChatSession([...messages, { role: "user", content: userMessage }, suicidalMessage]);
      } else {
        await saveChatSession([...messages, { role: "user", content: userMessage }, { role: "assistant", content: data.reply }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
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

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {selectedLang === 'hi' ? 'मानसिक स्वास्थ्य सहायक' : 'AI Mental Health Assistant'}
              </h1>
              <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">{selectedLang === 'hi' ? 'आपकी सुनने के लिए यहाँ हूँ' : 'Here to listen and support you'}</span>
                <span className="sm:hidden">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-gray-700 border-none outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Controls */}
            <button
              onClick={isSpeaking ? stopSpeaking : () => {}}
              className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                isSpeaking 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Voice output'}
            >
              {isSpeaking ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>

            {/* Status Indicators - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Heart className="w-3 h-3" />
                <span>Confidential</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 w-full">
        <div className="max-w-full sm:max-w-4xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ${
                msg.role === 'assistant' 
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                  : 'bg-gradient-to-br from-blue-400 to-purple-500'
              }`}>
                {msg.role === 'assistant' ? (
                  <Bot className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <User className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-[250px] sm:max-w-3xl ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 sm:p-4 rounded-2xl shadow-sm text-sm sm:text-base ${
                  msg.role === 'assistant' 
                    ? 'bg-white border border-gray-200 text-gray-800' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                } ${msg.role === 'assistant' ? 'rounded-tl-md' : 'rounded-tr-md'}`}>
                  
                  {/* Risk Level Indicator */}
                  {msg.riskLevel && msg.riskLevel !== 'Low' && (
                    <div className={`mb-2 flex items-center gap-2 text-xs px-2 py-1 rounded-full ${
                      msg.riskLevel === 'Suicidal' ? 'bg-red-100 text-red-700' :
                      msg.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      <span>Risk Level: {msg.riskLevel}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>
                  
                  {/* Crisis Detection Alert */}
                  {msg.isSuicidalDetection && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-600" />
                        <p className="text-red-700 text-sm font-medium">
                          🚨 {selectedLang === 'hi' ? 'आपातकालीन सहायता सक्रिय' : 'Emergency Support Activated'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {msg.isError && (
                    <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Connection error - please try again</span>
                    </div>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit', 
                    minute: '2-digit'
                  }) : ''}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2 sm:gap-4">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                <Bot className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-3 sm:p-4 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="ml-2 text-xs sm:text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Responses */}
      {messages.length <= 1 && (
        <div className="px-3 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Quick responses:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickResponses.map((response, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickResponse(response.text)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-xs sm:text-sm text-gray-700 transition-colors"
                >
                  <span>{response.emoji}</span>
                  <span className="hidden sm:inline">{response.text}</span>
                  <span className="sm:hidden">{response.text.split(' ')[0]}...</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-6 w-full">
        <div className="max-w-full sm:max-w-4xl mx-auto px-2 sm:px-0">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 pr-12 sm:pr-20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                placeholder={selectedLang === 'hi' ? 'अपनी भावनाएं साझा करें...' : 'Share your feelings...'}
                disabled={escalating || isTyping}
              />
              
              {/* Voice Input Button */}
              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  onClick={isListening ? () => recognition?.stop() : startListening}
                  disabled={!recognition || isTyping}
                  className={`p-1.5 sm:p-2 rounded-full transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  } disabled:opacity-50`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Mic className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={escalating || !input.trim() || isTyping}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2.5 sm:p-3 rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center"
            >
              {escalating || isTyping ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          
          {/* Help Text */}
          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3" />
                <span className="hidden sm:inline">{selectedLang === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Press mic to speak'}</span>
                <span className="sm:hidden">Voice</span>
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">{selectedLang === 'hi' ? 'पूर्ण गोपनीयता' : 'Completely confidential'}</span>
                <span className="sm:hidden">Private</span>
              </span>
            </div>
            <div className="text-right hidden sm:block">
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
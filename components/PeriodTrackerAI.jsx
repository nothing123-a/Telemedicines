"use client";

import { useState } from "react";
import { Brain, MessageCircle, X, Send } from "lucide-react";

export default function PeriodTrackerAI({ tracker }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Create context from tracker data
      const context = createPeriodContext(tracker);
      
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a specialized AI assistant for women's menstrual health. You provide supportive, accurate, and empathetic guidance about periods, symptoms, and reproductive health. 

Current user context: ${context}

Guidelines:
- Be supportive and understanding
- Provide helpful tips for managing symptoms
- Suggest when to consult a healthcare provider
- Offer lifestyle recommendations
- Be sensitive to emotional aspects of menstrual health
- Never provide medical diagnoses
- Encourage professional medical advice for serious concerns`
            },
            userMessage
          ]
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I'm having trouble responding right now. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const createPeriodContext = (tracker) => {
    if (!tracker) return "No tracking data available yet.";
    
    const cycleCount = tracker.cycles?.length || 0;
    const avgCycle = tracker.settings?.cycleLength || 28;
    const recentSymptoms = tracker.symptoms?.slice(-3) || [];
    
    let context = `User has tracked ${cycleCount} cycles. `;
    context += `Average cycle length: ${avgCycle} days. `;
    
    if (recentSymptoms.length > 0) {
      const commonSymptoms = recentSymptoms.flatMap(s => [...(s.physical || []), ...(s.mood || [])]);
      context += `Recent symptoms include: ${commonSymptoms.join(", ")}. `;
    }
    
    return context;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors z-50"
      >
        <Brain className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-pink-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-pink-800">Period Health AI</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm">
            <p className="mb-2">👋 Hi! I'm your period health assistant.</p>
            <p>Ask me about:</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Managing period symptoms</li>
              <li>• Cycle irregularities</li>
              <li>• Mood and energy tips</li>
              <li>• When to see a doctor</li>
            </ul>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.role === "user"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your period health..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
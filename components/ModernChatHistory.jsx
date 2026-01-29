"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  ChevronRight,
  Bot,
  User,
  Trash2,
  Download,
  Eye,
  AlertTriangle
} from "lucide-react";

export default function ModernChatHistory() {
  const { data: session } = useSession();
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    if (session?.user?.id) {
      fetchChatHistory();
    }
  }, [session]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chat-history");
      const data = await res.json();
      setChatSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this chat session?")) return;
    
    try {
      await fetch(`/api/chat-history/${sessionId}`, { method: "DELETE" });
      setChatSessions(prev => prev.filter(session => session._id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const exportSession = (session) => {
    const content = session.messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-session-${new Date(session.createdAt).toLocaleDateString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = filterBy === "all" || 
      (filterBy === "crisis" && session.messages.some(msg => msg.isSuicidalDetection)) ||
      (filterBy === "recent" && new Date(session.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getSessionSummary = (messages) => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return "No messages";
    
    const firstMessage = userMessages[0].content;
    return firstMessage.length > 100 ? firstMessage.substring(0, 100) + "..." : firstMessage;
  };

  const hasRiskIndicators = (messages) => {
    return messages.some(msg => msg.isSuicidalDetection || msg.riskLevel === 'High' || msg.riskLevel === 'Suicidal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading your chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
              <p className="text-gray-600 mt-1">
                Review your previous conversations with the AI mental health assistant
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              <span>{chatSessions.length} total sessions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search through your conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Sessions</option>
                <option value="recent">Recent (7 days)</option>
                <option value="crisis">Crisis Sessions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No matching conversations found" : "No chat history yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms or filters" 
                : "Start a conversation with your AI mental health assistant to see your history here"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => window.location.href = "/dashboard/mental-counselor"}
                className="btn-primary"
              >
                Start Your First Chat
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => {
                  setSelectedSession(session);
                  setShowSessionModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {session.messages.length} messages
                        </span>
                      </div>
                      {hasRiskIndicators(session.messages) && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Crisis Session</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-800 mb-2 font-medium">
                      Session Summary
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {getSessionSummary(session.messages)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSession(session);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Export session"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {showSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Chat Session - {formatDate(selectedSession.createdAt)}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedSession.messages.length} messages • {new Date(selectedSession.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {selectedSession.messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                      : 'bg-gradient-to-br from-blue-400 to-purple-500'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="text-white w-4 h-4" />
                    ) : (
                      <User className="text-white w-4 h-4" />
                    )}
                  </div>
                  
                  <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-xl ${
                      message.role === 'assistant' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    }`}>
                      {message.isSuicidalDetection && (
                        <div className="mb-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-red-700 text-sm font-medium">Crisis Detection Alert</span>
                          </div>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                    {message.timestamp && (
                      <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => exportSession(selectedSession)}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowSessionModal(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
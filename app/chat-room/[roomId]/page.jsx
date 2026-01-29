"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import SessionFeedbackModal from "@/components/SessionFeedbackModal";

export default function ChatRoom() {
  const { roomId } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize socket
    const socketInstance = io({
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000
    });
    setSocket(socketInstance);

    // Register user/doctor
    if (session.user.isDoctor) {
      socketInstance.emit("register-doctor", { doctorId: session.user.id });
    } else {
      socketInstance.emit("register-user", { userId: session.user.id });
    }

    // Join room
    socketInstance.emit("join-room", roomId);
    console.log('Joined chat room:', roomId);

    // Listen for new messages
    socketInstance.on("new-message", (message) => {
      console.log('Received new message via socket:', message);
      setMessages(prev => [...prev, message]);
    });

    // Handle user disconnection
    socketInstance.on("user-disconnected", () => {
      console.log('Other user disconnected from chat');
      if (!session.user.isDoctor) {
        // Redirect to dashboard for users
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setTimeout(() => {
          window.location.href = '/doctor';
        }, 2000);
      }
    });

    // Listen for re-escalation notifications
    socketInstance.on("re-escalation-started", (data) => {
      console.log('Re-escalation started:', data);
      alert(data.message);
    });

    // Get room info for feedback
    fetchRoomInfo();

    // Load existing messages
    fetchMessages();

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    console.log('Fetching messages for room:', roomId);
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`);
      const data = await response.json();
      console.log('Fetched messages:', data);
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      const data = await response.json();
      if (data.room) {
        setDoctorName(data.room.doctorId?.name || "Doctor");
        setSessionId(data.room.sessionId);
      }
    } catch (error) {
      console.error("Failed to fetch room info:", error);
    }
  };

  const handleFeedback = async (satisfied, rating, comment) => {
    try {
      const response = await fetch('/api/session/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          satisfied,
          rating,
          comment,
          userEmail: session.user.email
        })
      });
      
      const data = await response.json();
      console.log('Feedback response:', data);
      
      if (satisfied) {
        alert('Thank you for your feedback! We appreciate you taking the time to share your experience.');
        window.location.href = '/';
      } else {
        if (data.reEscalated) {
          const message = data.isDifferentDoctor ? 
            `We understand your concerns. We're connecting you with a different doctor: Dr. ${data.newDoctorName}` :
            `We're giving you another chance with Dr. ${data.newDoctorName}. They'll try a different approach.`;
          alert(message);
          // Wait a moment for the escalation to be processed
          setTimeout(() => {
            window.location.href = '/dashboard/mental-counselor';
          }, 2000);
        } else {
          alert('We apologize for the experience. No doctors are currently available for re-connection. Please try again later or contact emergency services if urgent.');
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback. Please try again.');
      window.location.href = '/';
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id) return;

    console.log('Sending message:', {
      roomId,
      senderId: session.user.id,
      senderType: session.user.isDoctor ? "doctor" : "user",
      message: newMessage.trim()
    });

    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: session.user.id,
          senderType: session.user.isDoctor ? "doctor" : "user",
          message: newMessage.trim(),
        }),
      });

      const data = await response.json();
      console.log('Message API response:', data);

      if (response.ok) {
        setNewMessage("");
      } else {
        console.error('Failed to send message:', data);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const endChat = () => {
    if (socket) {
      socket.emit("end-call", roomId);
      socket.disconnect();
    }
    if (session.user.isDoctor) {
      window.location.href = '/doctor';
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Elegant Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">💬</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-emerald-800">Therapy Chat</h1>
                <p className="text-sm text-emerald-600 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Safe & Confidential Space
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                {session?.user?.isDoctor ? '👩‍⚕️ Therapist' : '🌱 You'}
              </div>
              <button
                onClick={endChat}
                className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-4 py-2 rounded-full hover:from-red-500 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>📞</span>
                <span className="text-sm font-medium">End Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end space-x-3 ${
                message.senderId === session.user.id ? "justify-end" : "justify-start"
              }`}
            >
              {message.senderId !== session.user.id && (
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm">👩‍⚕️</span>
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  message.senderId === session.user.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-emerald-100 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.message}</p>
                <p className={`text-xs mt-2 ${
                  message.senderId === session.user.id ? "text-emerald-100" : "text-gray-500"
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.senderId === session.user.id && (
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm">🌱</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white/90 backdrop-blur-md border-t border-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts in this safe space..."
                className="w-full bg-white border-2 border-emerald-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400">
                💭
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Send</span>
              <span>✨</span>
            </button>
          </form>
          <p className="text-xs text-emerald-600 mt-3 text-center">
            🔒 Your conversation is private and secure
          </p>
        </div>
      </div>
      
      <SessionFeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onFeedback={handleFeedback}
        doctorName={doctorName}
      />
    </div>
  );
}
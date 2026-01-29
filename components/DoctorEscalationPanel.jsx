"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

export default function DoctorEscalationPanel({ inline = false }) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [socket, setSocket] = useState(null);

  const handleAcceptConnection = async (requestId) => {
    try {
      const response = await fetch("/api/escalate/accept-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionRequests(prev => prev.filter(r => r.requestId !== requestId));
        
        // Redirect doctor to room (session already created in accept-connection)
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error("Accept connection error:", error);
    }
  };

  const handleRejectConnection = async (requestId) => {
    setConnectionRequests(prev => prev.filter(r => r.requestId !== requestId));
  };

  useEffect(() => {
    if (!session?.user?.isDoctor || !session?.user?.id) return;

    const socketInstance = io({
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000
    });
    setSocket(socketInstance);

    socketInstance.emit("register-doctor", { doctorId: session.user.id });

    socketInstance.on("escalation-request", (request) => {
      setRequests(prev => [...prev, request]);
    });

    socketInstance.on("connection-request", (request) => {
      console.log("📨 Received connection request:", request);
      setConnectionRequests(prev => [...prev, request]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  const handleAccept = async (request) => {
    try {
      const response = await fetch("/api/escalate/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.requestId,
        }),
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.requestId !== request.requestId));
      }
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  const handleReject = async (request) => {
    try {
      const response = await fetch("/api/escalate/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.requestId,
        }),
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.requestId !== request.requestId));
      }
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  if (!session?.user?.isDoctor) return null;

  const containerClass = inline 
    ? "p-6" 
    : "fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50";

  return (
    <div className={containerClass}>
      {!inline && <h3 className="font-bold text-lg mb-3">Escalation Requests</h3>}
      
      {/* Connection Requests */}
      {connectionRequests.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h4 className="font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <span>📞</span>
            Connection Requests
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {connectionRequests.map((request, index) => (
              <div key={index} className="border border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{request.patientName}</p>
                    <p className="text-xs sm:text-sm text-blue-600 capitalize">📹 {request.connectionType} Session Request</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full self-start">
                    WAITING
                  </span>
                </div>
                
                <div className="bg-blue-100 border border-blue-200 rounded p-2 mb-3">
                  <p className="text-xs text-blue-700 flex items-start gap-1">
                    <span className="flex-shrink-0">🔔</span>
                    <span>Patient wants to start a {request.connectionType} session with you</span>
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleAcceptConnection(request.requestId)}
                    className="flex-1 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Accept {request.connectionType}
                  </button>
                  <button
                    onClick={() => handleRejectConnection(request.requestId)}
                    className="flex-1 bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600 transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Emergency Requests */}
      {requests.length === 0 && connectionRequests.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-400 text-3xl sm:text-4xl mb-2">💭</div>
          <p className="text-gray-500 text-sm sm:text-base">No pending requests</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">You'll be notified when users need help</p>
        </div>
      ) : (
        <div className={inline ? "grid gap-3 sm:gap-4" : "space-y-2 sm:space-y-3"}>
          {requests.map((request, index) => (
            <div key={index} className="border border-red-200 rounded-lg p-3 sm:p-4 bg-red-50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{request.userName}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{request.userEmail}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full self-start ${
                  request.isReEscalation ? 
                    'bg-orange-100 text-orange-800' : 
                    'bg-red-100 text-red-800'
                }`}>
                  {request.isReEscalation ? (request.isRetry ? 'RETRY' : 'RE-ESCALATED') : 'URGENT'}
                </span>
              </div>
              
              <div className="bg-red-100 border border-red-200 rounded p-2 mb-3">
                <p className="text-xs text-red-700 flex items-start gap-1">
                  <span className="flex-shrink-0">{request.isReEscalation ? '🔄' : '🚨'}</span>
                  <span>
                    {request.isReEscalation ? 
                      (request.isRetry ? 
                        'Patient was not satisfied with previous session and needs another try' :
                        'Patient was not satisfied and needs a different approach'
                      ) :
                      'User is in emotional distress and needs immediate support'
                    }
                  </span>
                </p>
                {request.isReEscalation && (
                  <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
                    <span className="flex-shrink-0">💡</span>
                    <span>
                      {request.isRetry ? 
                        'Consider a different therapeutic approach this time' :
                        'Fresh perspective needed - patient seeking alternative help'
                      }
                    </span>
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleAccept(request)}
                  className="flex-1 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition"
                >
                  Accept & Help
                </button>
                <button
                  onClick={() => handleReject(request)}
                  className="flex-1 bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600 transition"
                >
                  Pass to Another
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
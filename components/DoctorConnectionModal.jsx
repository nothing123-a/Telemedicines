"use client";
import { useState, useEffect } from "react";

export default function DoctorConnectionModal({ 
  isOpen, 
  onClose, 
  doctorName, 
  requestId,
  preSelectedType = null 
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  const handleConnection = async (type = preSelectedType) => {
    setIsConnecting(true);
    console.log('Sending connection request:', { requestId, connectionType: type });
    try {
      const response = await fetch("/api/escalate/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          connectionType: type,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onClose();
        // Show waiting message and start polling for connection acceptance
        alert(`${type} request sent to Dr. ${doctorName}. Please wait...`);
        // Start polling for connection status
        pollForConnectionAcceptance(requestId, type);
      } else {
        console.error("Failed to connect:", data.error);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const pollForConnectionAcceptance = (requestId, connectionType) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/escalate/status/${requestId}`);
        const data = await response.json();
        
        if (data.connectionStatus === "accepted") {
          clearInterval(pollInterval);
          // Redirect to room
          if (data.roomId) {
            window.location.href = `/${connectionType}-room/${data.roomId}`;
          } else {
            console.error('No roomId received from server');
            alert('Failed to create room. Please try again.');
          }
        } else if (data.connectionStatus === "rejected") {
          clearInterval(pollInterval);
          alert("Doctor declined the connection request.");
        }
      } catch (error) {
        console.error("Connection polling error:", error);
      }
    }, 2000);
    
    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(pollInterval), 120000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${
      showModal ? 'bg-black bg-opacity-50' : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl text-center">
            <div className="text-4xl mb-2">🎆</div>
            <h2 className="text-2xl font-bold mb-1">Doctor Available!</h2>
            <p className="text-green-100">Dr. {doctorName} is ready to help</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {preSelectedType ? (
              <>
                <p className="text-gray-600 text-center mb-6">
                  Ready to start your {preSelectedType === 'chat' ? 'chat consultation' : 'video call'} with Dr. {doctorName}?
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleConnection(preSelectedType)}
                    disabled={isConnecting}
                    className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 ${
                      preSelectedType === 'chat' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <span className="text-xl">{preSelectedType === 'chat' ? '💬' : '📹'}</span>
                    Start {preSelectedType === 'chat' ? 'Chat Session' : 'Video Call'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-center mb-6">
                  Choose how you'd like to connect with your doctor:
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleConnection("chat")}
                    disabled={isConnecting}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-xl">💬</span>
                    Start Chat Session
                  </button>

                  <button
                    onClick={() => handleConnection("video")}
                    disabled={isConnecting}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-xl">📹</span>
                    Start Video Call
                  </button>
                </div>
              </>
            )}

            {isConnecting && (
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Connecting...</span>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              disabled={isConnecting}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
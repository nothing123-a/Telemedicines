'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, Phone, MessageCircle } from 'lucide-react';

export default function EmergencyNotification() {
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io({
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: false,
      timeout: 20000
    });
    setSocket(newSocket);

    newSocket.on('emergency-request', (data) => {
      console.log('🚨 Emergency request received:', data);
      setEmergencyRequests(prev => [data, ...prev]);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('🚨 EMERGENCY REQUEST', {
          body: data.message,
          icon: '/emergency-icon.png'
        });
      }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => newSocket.close();
  }, []);

  const handleAcceptRequest = (escalation) => {
    window.location.href = `/chat-room/${escalation.id}`;
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div className="flex items-center mb-3">
        <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
        <h3 className="text-lg font-semibold text-red-800">🚨 Emergency Requests</h3>
      </div>
      
      {emergencyRequests.length === 0 ? (
        <p className="text-red-600">No emergency requests at the moment</p>
      ) : (
        <div className="space-y-3">
          {emergencyRequests.map((request, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-red-800">CRISIS PATIENT</h4>
                  <p className="text-sm text-gray-600">{request.escalation.symptoms}</p>
                  <p className="text-xs text-red-500">Risk Level: {request.escalation.riskLevel}</p>
                  <p className="text-xs text-gray-500">{new Date(request.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.escalation)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';

export default function GenieStatus() {
  const [status, setStatus] = useState({
    vapiPublicKey: false,
    vapiAssistantId: false,
    geminiApiKey: false,
    browserSupport: {
      speechRecognition: false,
      mediaDevices: false,
      webAudio: false
    }
  });

  useEffect(() => {
    checkGenieStatus();
  }, []);

  const checkGenieStatus = () => {
    // Check environment variables
    const vapiPublicKey = !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    const vapiAssistantId = !!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    
    // Check browser support
    const speechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const mediaDevices = !!navigator.mediaDevices?.getUserMedia;
    const webAudio = !!(window.AudioContext || window.webkitAudioContext);

    setStatus({
      vapiPublicKey,
      vapiAssistantId,
      geminiApiKey: true, // Server-side only
      browserSupport: {
        speechRecognition,
        mediaDevices,
        webAudio
      }
    });
  };

  const getStatusIcon = (isWorking) => isWorking ? '✅' : '❌';

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🧞 Genie Status</h3>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>VAPI Public Key:</span>
          <span>{getStatusIcon(status.vapiPublicKey)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAPI Assistant ID:</span>
          <span>{getStatusIcon(status.vapiAssistantId)}</span>
        </div>
        <div className="flex justify-between">
          <span>Speech Recognition:</span>
          <span>{getStatusIcon(status.browserSupport.speechRecognition)}</span>
        </div>
        <div className="flex justify-between">
          <span>Microphone Access:</span>
          <span>{getStatusIcon(status.browserSupport.mediaDevices)}</span>
        </div>
        <div className="flex justify-between">
          <span>Web Audio:</span>
          <span>{getStatusIcon(status.browserSupport.webAudio)}</span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {!status.vapiPublicKey && <div className="text-red-600">⚠️ VAPI keys missing</div>}
        {!status.browserSupport.speechRecognition && <div className="text-orange-600">⚠️ Speech recognition unavailable</div>}
        {!status.browserSupport.mediaDevices && <div className="text-orange-600">⚠️ Microphone access needed</div>}
      </div>
    </div>
  );
}
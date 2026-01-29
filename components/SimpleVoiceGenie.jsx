"use client";

import { useState, useRef } from 'react';

export default function SimpleVoiceGenie() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setTranscript('Speech recognition not supported. Try Chrome.');
        return;
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('🎤 Listening... Speak now!');
      };

      recognitionRef.current.onresult = async (event) => {
        const userSpeech = event.results[0][0].transcript;
        setTranscript(`You said: "${userSpeech}"`);
        setIsProcessing(true);
        
        try {
          const response = await fetch('/api/gemini-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: [{ role: 'user', content: userSpeech }],
              userId: 'voice-user'
            })
          });
          
          const data = await response.json();
          if (data.reply) {
            setResponse(data.reply);
            const utterance = new SpeechSynthesisUtterance(data.reply);
            speechSynthesis.speak(utterance);
          } else {
            setResponse('Sorry, I could not process your request.');
          }
        } catch (error) {
          setResponse('Sorry, I encountered an error.');
        }
        
        setIsProcessing(false);
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setTranscript('❌ Microphone permission denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          setTranscript('❌ No speech detected. Try speaking louder.');
        } else {
          setTranscript(`❌ Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
      
    } catch (err) {
      setTranscript(`❌ Microphone access denied: ${err.message}`);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="fixed top-16 left-4 z-50 bg-white rounded-lg shadow-lg border p-4 w-80">
      <h3 className="font-bold text-sm mb-2">🎤 Simple Voice Genie</h3>
      
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`w-full py-2 px-4 rounded text-white font-medium mb-2 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : isProcessing
            ? 'bg-gray-400'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isProcessing ? 'Processing...' : isListening ? 'Stop Listening' : 'Start Voice Chat'}
      </button>

      {transcript && (
        <div className="mb-2 p-2 bg-blue-100 rounded text-xs">
          <strong>Input:</strong> {transcript}
        </div>
      )}

      {response && (
        <div className="mb-2 p-2 bg-green-100 rounded text-xs">
          <strong>Genie:</strong> {response}
        </div>
      )}

      <div className="text-xs text-gray-600">
        Click "Start Voice Chat" and speak your question. Genie will respond with voice.
      </div>
    </div>
  );
}